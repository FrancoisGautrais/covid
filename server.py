import time
from threading import Thread

from http_server.httprequest import HTTPRequest, HTTPResponse
from http_server.restserver import RESTServer
from http_server.httpserver import HTTPServer

import log
import utils
from db import DB

class Server(RESTServer):




    def __init__(self, ip="localhost", attrs={"mode" : HTTPServer.SPAWN_THREAD}, restOptions={}, dbfile="covid.sqlite"):
        RESTServer.__init__(self, ip, attrs, restOptions)
        log.Log.init(log.Log.DEBUG)
        self.db = DB(dbfile)

        self.route("POST", "/query", self._handle_query)
        self.route_file_gen("GET", ["/", "index.html"], "www/index.html", needAuth=False)
        self.route("GET", "/query/metropole/#metropole", self._handle_get_metro)
        self.route("GET", "/query/metropole/#metropole/age/#age", self._handle_get_metro)
        self.route("GET", "/query/departement/#departement", self._handle_get_departement)
        self.route("GET", "/query/departement/#departement/age/#age", self._handle_get_departement)

        self.route("GET", "/chart/metropole/#metropole", self._handle_chart)
        self.route("GET", "/chart/metropole/#metropole/age/#age", self._handle_chart)
        self.route("GET", "/chart/departement/#departement", self._handle_chart)
        self.route("GET", "/chart/departement/#departement/age/#age", self._handle_chart)

        self.route("GET", "/update", self._handle_update)
        self.static("/", "www")

    def _handle_chart(self, req: HTTPRequest, res: HTTPResponse):
        isMetro = req.path.startswith("/chart/metropole")
        ville = req.params["metropole"] if "metropole" in req.params else None
        dep = req.params["departement"] if "departement" in req.params else None
        age = req.params["age"] if "age" in req.params else 0
        out = None
        d = None
        if isMetro:
            out = self.db.query_metropole({"ville" : ville,"age" : age})
            d={"chart" : out, "zone" : ville, "age": age, "table" : "metropole" }
        else:
            out = self.db.query_dep({ "departement" : dep, "age" : age})
            d={"chart" : out, "zone" : utils.resolve_dep(dep), "age": age, "table" : "departement" }
        res.serve_file_gen("www/chart.html", d)

    def _handle_update(self, req: HTTPRequest, res: HTTPResponse):
        self.db.update()

    def _handle_get_metro(self, req: HTTPRequest, res: HTTPResponse):
        ville = req.params["metropole"]
        age = req.params["age"] if "age" in req.params else 0
        res.serv_json_ok(self.db.query_metropole({"ville" : ville,"age" : age}))


    def _handle_get_departement(self, req: HTTPRequest, res: HTTPResponse):
        dep = req.params["departement"]
        age = req.params["age"] if "age" in req.params else 0
        res.serv_json_ok(self.db.query_dep({ "departement" : dep, "age" : age}))


    def _handle_query(self, req: HTTPRequest, res: HTTPResponse):
        body = req.body_json()
        if not body and not isinstance(body, dict):
            return res.serv_json_bad_request("Erreur pas de body passé")
        if not isinstance(body, dict):
            return res.serv_json_bad_request("Erreur le body doit être un objet JSON")

        log.d("/query ",body)
        if not "table" in body: return res.serv_json_bad_request("Erreur le champ 'table' est obligatoie")
        table = body ["table"]
        if not table in ["metropole", "departement"]:
            return res.serv_json_bad_request("Erreur le champ 'table' doit être 'metropole' ou 'departement'")

        if table=="metropole" and (not "metropoles" in body or not isinstance(body["metropoles"], list)):
            return res.serv_json_bad_request("Erreur pour table='metropole' le champs 'metropoles' doit être donnée (list)")

        if table=="departement" and (not "departements" in body or not isinstance(body["departements"], list)):
            return res.serv_json_bad_request("Erreur pour table='departement' le champs 'departements' doit être donnée (list)")

        zone = body["metropoles"] if table=="metropole" else body["departements"]
        age = body["age"] if body and "age" in body else 0
        datemin = body["datemin"] if (body and "datemin" in body and body["datemin"])  else 0
        datemax = body["datemax"] if (body and "datemax" in body and body["datemax"]) else time.time()
        out = {
            "table" : table,
            "age" : age,
            "datemin" : body["datemin"] if (body and "datemax" in body) else None,
            "datemax" : body["datemax"] if (body and "datemax" in body) else None
        }
        if table == "metropole":
            out["metropoles"] = body["metropoles"]
            return res.serv_json_ok(self.db.query_multiple_metropole(out))
        else:
            out["departements"] = list(map(lambda x: x, body["departements"]))
            return res.serv_json_ok(self.db.query_multiple_departement(out))


    def _handle_get_data(self, req: HTTPRequest, res: HTTPResponse):
        body = req.body_json()
        out = []
        i=0
        if not isinstance(body, list):
            return res.serv_json_bad_request("Erreur les données POST doivent être une liste")
        for elem in body:
            """
                {
                    table: "metropole" | "departement",
                    args : ....
                }
            """
            table = elem["table"] if elem and "table" in elem else None
            args = elem["args"] if elem and "args" in elem else None
            if not table:
                return res.serv_json_bad_request("Erreur la table n'est pas donnée (élément %d)" % i)
            if not table in ["metropole", "departement"]:
                return res.serv_json_bad_request("Erreur la table est incorrect ('%s', élément %d)" % (
                    table, i
                ))
            if args==None:
                return res.serv_json_bad_request("Erreur aucun argument n'est passé (élément %d)" %i)
            if not isinstance(args, dict):
                return res.serv_json_bad_request("Erreur l'argument doit être un objet JSON (élément %d)" % i)
            if table=="metropole":
                out.append(self.db.query_metropole(args))
            elif table=="departement":
                out.append(self.db.query_dep(args))
            else:
                return res.serv_json_bad_request("Erreur inattendue...")
            i+=1
        res.serv_json_ok(out)

server = Server()

import sys
port = int(sys.argv[1]) if len(sys.argv)>1 else 8080
server.listen(port)