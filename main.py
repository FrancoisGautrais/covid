import datetime
import json
import exporter
import log
import sqlite_connector
import requests


import http_server




#inc = IncidenceMetroLoader(sql, "/home/fanch/tmp/sg-metro-opendata-2020-10-26-19h20.csv")
#inc = IncidenceDepLoader(sql, "/home/fanch/tmp/sp-pe-tb-quot-dep-2020-10-25-19h15.csv")
#inc = IncidenceMetroLoader(sql, url="https://www.data.gouv.fr/fr/datasets/r/61533034-0f2f-4b16-9a6d-28ffabb33a02")


"""

print(url_finder("https://www.data.gouv.fr/fr/datasets/taux-dincidence-de-lepidemie-de-covid-19/", {
    "encodingFormat": "csv",
    "name" : "heb-dep"
}))"""

#x = IncidenceDepLoader.from_data_gouv(sql)
#x = IncidenceMetroLoader.from_data_gouv(sql)

import db

x = db.DB()
