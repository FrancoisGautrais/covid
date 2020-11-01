import datetime
import json

import requests
import utils
import log


METROPOLES_LIST = {
    "243300316": "Bordeaux",
    "242900314": "Brest",
    "246300701": "Clermont-Auvergne",
    "242100410": "Dijon",
    "200040715": "Grenoble",
    "245900410": "Lille",
    "200046977": "Lyon",
    "200054807": "Marseille",
    "200039865": "Metz",
    "243400017": "Montpellier",
    "245400676": "Nancy",
    "244400404": "Nantes",
    "200030195": "Nice",
    "244500468": "Orléans",
    "200054781": "Paris",
    "243500139": "Rennes",
    "200023414": "Rouen",
    "244200770": "Saint Etienne",
    "246700488": "Strasbourg",
    "248300543": "Toulon",
    "243100518": "Toulouse",
    "243700754": "Tours"
}


def parse_date(date : str):
    heure = date[date.index("T")+1:].split(":")
    date = date[:date.index("T")].split("-")
    date = list(map(lambda x : int(x),  date))
    heure = list(map(lambda x : int(float(x)),  heure))
    return datetime.datetime(date[0], date[1], date[2], heure[0], heure[1], heure[2])



def url_finder(srcurl, filter):
    ret = []
    req=requests.get(srcurl)
    content = req.content.decode("utf-8")
    js = None
    for line in content.split("\n"):
        if line.startswith('<script id="json_ld" type="application/ld+json">'):
            js = json.loads(line[48:-9])
        if line.startswith('        <i>Site en cours de maintenance, revenez un peu plus tard.</i>'):
            return []

    for elem in js["distribution"]:
        ok = True
        for key in filter:
            if not (key in elem and filter[key] in elem[key]):
                ok=False
                break
        if ok:
            ret.append(elem)
    return ret



class SQLoader:

    def __init__(self, sql, file=None, url=None, meta=None):
        self.db=sql
        self.inserted=0
        self.table=None
        self.url = url if url else file
        self.meta=meta
        self.latest = 0
        self.date = parse_date(meta["dateModified"]).timestamp() if (meta and "dateModified" in meta) else 0
        if url:
            req = requests.get(url)
            self.file=req.content.decode("utf-8")
        else:
            with open(file, "r") as f:
                self.file=f.read()
        self.data=[]

    def set_latest(self, table, val):
        if val>self.latest:
            self.db.exec("")
            self.latest=val


    def load(self):
        i=0
        if self.test():
            log.i("Loading %s : %s" % (self.url, self.meta['name'] if (self.meta and 'name' in self.meta) else "Anonyme"))
            for line in self.file.split("\n"):
                if i>0 and len(line):
                    row=line.split(";")
                    self.data.append(row)
                    if self.insert(row):
                        self.inserted+=1
                i+=1
            self.db.exec("""
                insert into metadata values ( '%s', '%s', '%s', %d, %d)
            """% (utils.new_id(32), self.table, self.url, self.date, self.inserted))
            url = self.url+""
            if self.meta and 'name' in self.meta:
                url+=" (%s)"%self.meta["name"]
            log.i("\t%s -> %d row modified or inserted" % (url, self.inserted))

            self.db.commit()

    def insert(self, row):
        raise NotImplemented()

    def test(self):
        return self.db.one("select count(*) from metadata where table_dest='%s' and url='%s' " % (self.table, self.url))<=0


class IncidenceMetroLoader(SQLoader):

    def __init__(self, sql, file=None, url=None, meta=None):
        SQLoader.__init__(self, sql, file, url, meta)
        self.table='incidence_metro'



    def insert(self, row):
        try:
            ville=METROPOLES_LIST[row[0]]
        except:
            return
        id=ville+row[1]+str(int(float(row[2])))
        tmp = row[1].split("-")[3:]
        dt = datetime.datetime(int(tmp[0]), int(tmp[1]), int(tmp[2])).timestamp()
        ret = self.db.onerow("select lastUpdate from incidence_metro where id='%s'"%id)
        if (not ret):
            self.db.exec("insert into incidence_metro values ('%s', '%s', %s, %s, %s, %d) " % (
                id, ville, dt, int(row[2]), float(row[3]), self.date
            ))
            #log.d("Ville Insert %s %s %s (%s)" % (ville, str_date(dt), row[2], row[3]))
            return True
        elif ret[0]<self.date:
            self.db.exec("update incidence_metro set incidence=%f, lastUpdate=%d where id='%s' " % (
                float(row[3]), self.date, id
            ))
            #log.d("Ville Update %s %s %s (%s) (%d<%d)" % (ville, str_date(dt), row[2], row[3], ret[0], self.date))
            return True

        return False

    @staticmethod
    def from_data_gouv(sql):
        ret = url_finder("https://www.data.gouv.fr/fr/datasets/indicateurs-de-lactivite-epidemique-taux-dincidence-de-lepidemie-de-covid-19-par-metropole/", {
            "encodingFormat": "csv",
            "name": "sg-metro-opendata"
        })
        for x in ret:
            tmp = IncidenceMetroLoader(sql, url=x['url'], meta=x)
            tmp.load()



class IncidenceDepLoader(SQLoader):

    def __init__(self, sql, file=None, url=None, meta=None):
        SQLoader.__init__(self, sql, file, url, meta)
        self.table='incidence_dep'

    @staticmethod
    def from_data_gouv(sql):
        ret = url_finder("https://www.data.gouv.fr/fr/datasets/taux-dincidence-de-lepidemie-de-covid-19/", {
            "encodingFormat": "csv",
            "name" : "quot-dep"
        })
        for x in ret:
            tmp = IncidenceDepLoader(sql, url=x['url'], meta=x)
            tmp.load()



    def insert(self, row):
        id=row[0]+row[1]+str(int(float(row[4])))
        tmp = row[1].split("-")

        dt = datetime.datetime(int(tmp[0]), int(tmp[1]), int(tmp[2])).timestamp()
        ret = self.db.onerow("select lastUpdate from incidence_dep where id='%s'"%id)
        if (not ret):
            self.db.exec("insert into incidence_dep values ('%s', '%s', %s, %d, %d, %d, %d) " % (
                id,
                row[0], dt, int(float(row[2])), int(row[3]), int(float(row[4])), self.date
            ))
            #log.d("Dep Insert %s %s %s (%d)" % (row[0], str_date(dt), row[3], int(float(4))))
            return True
        elif ret[0]<self.date:
            self.db.exec("update incidence_dep set positif=%d, population=%d, lastUpdate=%d where id='%s'"%(
                int(float(row[3])), int(float(row[2])), self.date, id
            ))
            #log.d("Dep Update %s %s %s (%d) (%d<%d)" % (row[0], str_date(dt), row[3], int(float(4)), ret[0], self.date))
            return True
        return False


