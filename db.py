import time
from threading import Thread

import log
import sqlite_connector
import sqlloader
import utils

METRO_SCHEM = """
    create table incidence_metro (
        id text primary key,
        metropole text,
        date int,
        age int,
        incidence real,
        lastupdate int
    );

"""

DEP_SCHEM = """
    create table incidence_dep (
        id text primary key,
        dep text,
        date int,
        population int,
        positif int,
        age int,
        lastupdate int
    );
"""

META_SCHEM = """
    create table metadata (
        id text primary key,
        table_dest text,
        url text,
        date int,
        added int
    )   
"""


VAR_SCHEM = """
    create table var (
        key text primary key,
        value text
    )
"""


DEFAULT_QUERY_METROPOLE = {
    "ville" : "Rennes",
    "age" : 0,
    "datemin" : 0,
    "datemax" : None
}


DEFAULT_QUERY_DEP = {
    "dep" : 35,
    "age" : 0,
    "datemin" : 0,
    "datemax" : None
}


DEFAULT_QUERY_MULTIPLE_METROPOLE = {
    "dep" : [35],
    "age" : 0,
    "datemin" : 0,
    "datemax" : None
}




class DB(sqlite_connector.SQConnector):

    def __init__(self, file="covid.sqlite"):
        sqlite_connector.SQConnector.__init__(self, "covid.sqlite")
        if not self.table_exists("incidence_dep"):
            self.exec(DEP_SCHEM)
            self.commit()

        if not self.table_exists("incidence_metro"):
            self.exec(METRO_SCHEM)
            self.commit()

        if not self.table_exists("metadata"):
            self.exec(META_SCHEM)
            self.commit()

        if not self.table_exists("var"):
            self.exec(VAR_SCHEM)
            self.commit()
        #self.update()
        self.update_thread()

    def var_get(self, key, default=None):
        if self.var_has(key): return self.one("select value from var where key='%s' " % key)
        return default

    def var_has(self, key):
        return self.one("select count(value) from var where key='%s' " % key)>0

    def var_set(self, key, val):
        if self.var_has(key):
            if isinstance(val, str): self.exec("update var set value='%s' where key='%s'" %(val, key))
            elif isinstance(val, int): self.exec("update var set value=%d where key='%s'" %(val, key))
            elif isinstance(val, float): self.exec("update var set value=%f where key='%s'" %(val, key))
            else: raise Exception("Not implemented")
        else:
            if isinstance(val, str): self.exec("insert into var values ('%s', '%s')" %(key, val))
            elif isinstance(val, int): self.exec("insert into var values ('%s', %d)" %(key, val))
            elif isinstance(val, float): self.exec("insert into var values ('%s', %f)" %(key, val))
            else: raise Exception("Not implemented")
        self.commit()

    def var_delete(self, key):
        self.exec("delete from var where key='%s'" %key)
        self.commit()

    def get_legend(self, table):
        return {
            "source" : "data.gouv.fr",
            "url" : "https://www.data.gouv.fr/fr/datasets/indicateurs-de-lactivite-epidemique-taux-dincidence-de-lepidemie-de-covid-19-par-metropole/" if (table=="metropole") else "https://www.data.gouv.fr/fr/datasets/taux-dincidence-de-lepidemie-de-covid-19/",
            "last_update" : utils.str_date(self.last_update("incidence_metro" if (table=="metropole") else "incidence_dep"))
        }

    def last_update(self, table=None):
        if table: return self.one("SELECT max(date) from metadata where table_dest='%s'" % table)
        return self.one("SELECT max(date) from metadata")

    def update(self):
        toload = [sqlloader.IncidenceMetroLoader, sqlloader.IncidenceDepLoader]

        for classe in toload:
            classe.from_data_gouv(self)

        self.var_set("last_update", time.time())

    """
         Entrée : {
            metropoles : [...],
            age : ... ,
            datemin : ,
            datemax
         }
         Sortie : {
            type : "multiple",
            table: "metropole",
            headers : [Noms des métropoles],
            age : ... ,
            labels : [dates],
            data : [ ville1 :[VILLE1], [Ville2], ... ]
         }
    """


    def query_multiple_metropole(self, data):
        villes = data["metropoles"]
        age = data["age"]
        datemin = data["datemin"] if ("datemin" in data and data["datemin"]) else 0
        datemax =  data["datemax"] if ("datemax" in data and data["datemax"]) else int(time.time())
        ret = {
            "type" : "multiple",
            "table" : "metropole",
            "headers" : villes,
            "datemin" : data['datemin'] if ("datemin" in data) else None,
            "datemax" : data['datemax'] if ("datemax" in data) else None,
            "zones" : villes,
            "legend" : self.get_legend("metropole"),
            "age" : age,
            "last_update" : utils.str_date(self.last_update("incidence_metro")),
            "labels" : [],
            "data" : []
        }
        out = []
        if len(villes):
            ret["labels"] = list(map(lambda x: utils.str_date(x[0]), self.exec("""
                select date from incidence_metro where metropole='%s' and age=%d and 
                date>=%d and date<=%d order by date asc 
            """ % (villes[0], age, datemin, datemax ))))
        for ville in villes:
            ret["data"].append(list(map(lambda x: x[0],
                self.exec("""
                    select incidence from incidence_metro where  metropole='%s' and age=%d and 
                    date>=%d and date<=%d order by date asc 
                """% (ville, age, datemin, datemax ))
             )))
        return ret

    def update_thread(self):
        class updater(Thread):

            def __init__(self, db):
                Thread.__init__(self)
                self.db=db

            def run(self):
                while True:
                    try:
                        self.db.update()
                    except Exception as err:
                        log.e("Erreur (update) : ", err)
                    time.sleep(3600*2)

        up = updater(self)
        up.start()

    def query_multiple_departement(self, data):
        deps = data["departements"]
        age = data["age"]
        datemin = data["datemin"] if ("datemin" in data and data["datemin"]) else 0
        datemax =  data["datemax"] if ("datemax" in data and data["datemax"]) else int(time.time())
        ret = {
            "type" : "multiple",
            "table" : "departement",
            "legend" : self.get_legend("departement"),
            "headers" : utils.resolve_dep(deps),
            "datemin" : data['datemin'] if ("datemin" in data) else None,
            "datemax" : data['datemax'] if ("datemax" in data) else None,
            "zones" : deps,
            "last_update" : utils.str_date(self.last_update("incidence_dep")),
            "age" : age,
            "labels" : [],
            "data" : []
        }
        out = []
        if len(deps):
            ret["labels"] = list(map(lambda x: utils.str_date(x[0]), self.exec("""
                select date from incidence_dep where dep='%s' and age=%d and 
                date>=%d and date<=%d order by date asc 
            """ % (deps[0], age, datemin, datemax ))))
        for dep in deps:
            tmp = self.exec("""
                    select positif, population from incidence_dep where  dep='%s' and age=%d and 
                    date>=%d and date<=%d order by date asc 
                """% (dep, age, datemin, datemax ))
            #tmp = list(map(lambda x: x[1], sql))
            out = []
            i = 0
            for row in tmp:
                incidence = 0
                if i >= 7:
                    for x in range(7):
                        incidence += tmp[i - x][0]
                else:
                    for x in range(i):
                        incidence += tmp[i - x][0]
                    incidence += row[0] * (7 - i)
                incidence = (100000 * incidence) / row[1]
                out.append(incidence)
                i += 1
            ret["data"].append(out)
        return ret



    def query_metropole(self, data):
        data = utils.dictassign({}, DEFAULT_QUERY_METROPOLE, data)
        ville = data["ville"]
        age = int(data["age"])
        datemin = data["datemin"] if ("datemin" in data and data["datemin"]) else 0
        datemax =  data["datemax"] if ("datemax" in data and data["datemax"]) else int(time.time())
        return {
            "type" : "simple",
            "table" : "metropole",
            "metropole": ville,
            "legend" : self.get_legend("metropole"),
            "age": age,
            "last_update" : utils.str_date(self.last_update("incidence_metro")),
            "headers" : ["date", "age", "incidence"],
            "data": list(map(lambda x: [utils.str_date(x[0])]+list(x[1:]) ,self.exec("""
                        select date, age, incidence from incidence_metro where metropole='%s' and age=%d and 
                        date>=%d and date<=%d  order by date asc
                    """ % (
                        ville, age, datemin, datemax
                    ))))
            }

    def query_dep(self, data):
        data = utils.dictassign({}, DEFAULT_QUERY_DEP, data)
        dep = int(data["dep"])
        age = int(data["age"])
        datemin = data["datemin"] if ("datemin" in data and data["datemin"]) else 0
        datemax =  data["datemax"] if ("datemax" in data and data["datemax"]) else int(time.time())

        tmp = self.exec("""
            select date, population, positif, age from incidence_dep where dep='%s' and age=%d and 
            date>=%d and date<=%d order by date asc
        """ % (
            dep, age, datemin, datemax
        ))
        out = []
        i=0
        for row in tmp:
            incidence=0
            if i>=7:
                for x in range(7):
                    incidence+=tmp[i-x][2]
            else:
                for x in range(i):
                    incidence+=tmp[i-x][2]
                incidence+=row[2]*(7-i)
            incidence = (100000*incidence)/row[1]
            out.append([utils.str_date(row[0])]+list(row[1:])+[incidence])
            i+=1
        return {
            "type" : "simple",
            "table" : "departement",
            "legend" : self.get_legend("departement"),
            "departement" : str(dep)+" - "+utils.resolve_dep(dep),
            "last_update" : utils.str_date(self.last_update("incidence_dep")),
            "age" : age,
            "headers" : ["date", "population", "positif", "age", "incidence"],
            "data" : out
        }


