import datetime

import log

class CsvExporter:

    def __init__(self, sql, data=None):
        self.db = sql
        self.data=data if data else {}

    def testargs(self, key, type=None):
        if not( key in self.data and (not type or isinstance(self.data[key], type))):
            raise Exception("Mauvais argument: %s doit être de type : %s"% (key, str(type)))

    def testargsdef(self, key, type, default):
        if not(key in self.data and (not type or isinstance(self.data[key], type))):
            self.data[key]=default

    def export(self, file):
        errors = self.check_params()
        if errors: return False
        data=self.do_export()
        with open(file, "w") as f:
            for line in data:
                for cell in line:
                    val=""
                    if isinstance(cell, str): val='"%s"' % cell
                    else: val = str(cell)
                    f.write(val+";")
                f.write(val+"\n")
        return True

    def args(self, key):
        return self.data[key]

    def check_params(self):
        raise NotImplementedError()

    def do_export(self, file):
        raise NotImplementedError()


class MetroCsvExporter(CsvExporter):

    def __init__(self, sql, data=None):
        CsvExporter.__init__(self, sql, data)

    def check_params(self):
        self.testargsdef("metropole", str, "Rennes")
        self.testargsdef("age", int, 0)
        self.testargsdef("datemax", int, datetime.datetime.now().timestamp())
        self.testargsdef("datemin", int, 0)

    def do_export(self):
        query = "select * from incidence_metro where metropole = '%s' and age=%d and date<=%d and date>=%d   order by date asc" % (
            self.args("metropole"), self.args("age"), self.args("datemax"), self.args("datemin")
        )
        log.e(query)
        ret = self.db.exec(query)
        print(ret)
        out = []
        for line in ret:
            ville = line[1]
            date = datetime.datetime.fromtimestamp(line[2])
            age = line[3]
            incidence = line[4]
            out.append((ville, str(date.day)+"/"+str(date.month)+"/"+str(date.year), age, incidence))
        return out




class DepCsvExporter(CsvExporter):

    def __init__(self, sql, data=None):
        CsvExporter.__init__(self, sql, data)

    def check_params(self):
        self.testargsdef("dep", int, 35)
        self.testargsdef("age", int, 0)
        self.testargsdef("datemax", int, datetime.datetime.now().timestamp())
        self.testargsdef("datemin", int, 0)

    def do_export(self):
        query = "select * from incidence_dep where dep = '%s' and age=%d and date<=%d and date>=%d   order by date asc" % (
            self.args("dep"), self.args("age"), self.args("datemax"), self.args("datemin")
        )
        log.e(query)
        ret = self.db.exec(query)
        out = []
        for line in ret:
            dep = line[1]
            date = datetime.datetime.fromtimestamp(line[2])
            pop = line[3]
            pos = line[4]
            out.append((dep, str(date.day)+"/"+str(date.month)+"/"+str(date.year), pop, pos))
        return out

