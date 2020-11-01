import datetime

import numpy as np
import math
import random

class RandomGenerator:
    def gen(self): raise Exception("Error")

class RandomGauss(RandomGenerator):
    def __init__(self, mu, var, n=32):
        self.mu=mu
        self.var=var
        sigma=math.sqrt(var)
        self.list=np.linspace(mu - 3*sigma, mu + 3*sigma, n)
        self._values=stats.norm.pdf(self.list, mu, sigma)
        self.values=[]
        max=0
        for x in self._values:
            if x>max: max=x
        acc=0
        for x in self._values:
            tmp=int(x/max*100)
            acc+=tmp
            self.values.append(acc)

    def show(self):
        plt.plot(self.list, self._values)
        plt.show()

    def gen(self):
        n=random.randint(0, self.values[-1])
        for i in range(len(self.values)):
            x=self.values[i]
            if x>=n: return self.list[i]


class RandomInt(RandomGenerator):
    def __init__(self, a, b):
        self.min = a
        self.max = b

    def gen(self):
        return random.randint(self.min, self.max)

class RandomFloat(RandomGenerator):
    def __init__(self, a, b):
        self.min=a
        self.max=b

    def gen(self):
        return self.min+random.random()*(self.max-self.min)


import random
import uuid
from urllib import parse
from http_server.utils import new_id
from hashlib import sha3_512
import base64

def dictassign(dest, *sources):
    for d in sources:
        for key in d:
            dest[key]=d[key]
    return dest

def dictcopy(*sources):
    return dictassign({}, *sources)


def urlencode(x):
    return parse.quote_plus(x)

def urldecode(x):
    return parse.quote_plus(x)



def password(pwd):
    x=sha3_512(pwd.encode()).digest()
    return base64.b64encode(x).decode("ascii")

def check_password(plain, encr):

    return password(plain)==encr

def new_key(size):
    out = ""
    chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_"
    for i in range(size):
        out += chars[random.randint(0, len(chars) - 1)]
    return out

def str_date(date : int):
    date = datetime.datetime.fromtimestamp(date)
    return "%02d/%02d/%04d %02d:%02d" % (
        date.day, date.month, date.year, date.hour, date.minute
    )

DEP_LIST={"01":"Ain","02":"Aisne","03":"Allier","05":"Hautes-Alpes","04":"Alpes-de-Haute-Provence","06":"Alpes-Maritimes","07":"Ardèche","08":"Ardennes","09":"Ariège","10":"Aube","11":"Aude","12":"Aveyron","13":"Bouches-du-Rhône","14":"Calvados","15":"Cantal","16":"Charente","17":"Charente-Maritime","18":"Cher","19":"Corrèze","2a":"Corse-du-sud","2b":"Haute-corse","21":"Côte-d'or","22":"Côtes-d'armor","23":"Creuse","24":"Dordogne","25":"Doubs","26":"Drôme","27":"Eure","28":"Eure-et-Loir","29":"Finistère","30":"Gard","31":"Haute-Garonne","32":"Gers","33":"Gironde","34":"Hérault","35":"Ile-et-Vilaine","36":"Indre","37":"Indre-et-Loire","38":"Isère","39":"Jura","40":"Landes","41":"Loir-et-Cher","42":"Loire","43":"Haute-Loire","44":"Loire-Atlantique","45":"Loiret","46":"Lot","47":"Lot-et-Garonne","48":"Lozère","49":"Maine-et-Loire","50":"Manche","51":"Marne","52":"Haute-Marne","53":"Mayenne","54":"Meurthe-et-Moselle","55":"Meuse","56":"Morbihan","57":"Moselle","58":"Nièvre","59":"Nord","60":"Oise","61":"Orne","62":"Pas-de-Calais","63":"Puy-de-Dôme","64":"Pyrénées-Atlantiques","65":"Hautes-Pyrénées","66":"Pyrénées-Orientales","67":"Bas-Rhin","68":"Haut-Rhin","69":"Rhône","70":"Haute-Saône","71":"Saône-et-Loire","72":"Sarthe","73":"Savoie","74":"Haute-Savoie","75":"Paris","76":"Seine-Maritime","77":"Seine-et-Marne","78":"Yvelines","79":"Deux-Sèvres","80":"Somme","81":"Tarn","82":"Tarn-et-Garonne","83":"Var","84":"Vaucluse","85":"Vendée","86":"Vienne","87":"Haute-Vienne","88":"Vosges","89":"Yonne","90":"Territoire de Belfort","91":"Essonne","92":"Hauts-de-Seine","93":"Seine-Saint-Denis","94":"Val-de-Marne","95":"Val-d'oise","976":"Mayotte","971":"Guadeloupe","973":"Guyane","972":"Martinique","974":"Réunion" }

def resolve_dep(n):
    if isinstance(n, (list, tuple)):
        return list(map(lambda x: resolve_dep(x), n))
    if not isinstance(n, str): n=str(n)
    if len(n)==1: n=0+n
    if n in DEP_LIST:
        return DEP_LIST[n]
    return "Incoonu"