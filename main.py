import os
import sys
from http_server.log import BackupLog
import http_server.utils

from http_server.config import cfg
cfg.init({
    "listen" : {
        "address" : "localhost",
        "port" : 8082
    },
    "server" : {
        "mode" : "spawn"
    },
    "database" : {
        "filename" : "covid.sqlite"
    },
    "log" : {
        "level" : "DEBUG",
        "filename" : "covid.log"
    },
    "restoptions": {

    }
},
[
    "covid.cfg",
    "~/.config/covid/covid.cfg",
    "/usr/shar/covid/covid.cfg",
    "/etc/covid/covid.cfg",
])


def print_help(err):
    if err: print(err)
    print("Usage %s [OPTIONS | config NAME | backup-log]" % sys.argv[0])
    print("config NAME : Affiche la valeur de la configuretion NAME")
    print("backup-log :Copie les logs existants")
    print("OPTIONS:")
    print("\t -p | --port PORT : le serveur écoute sur le port PORT")
    print("\t -a | --address ADDRESS : le serveur écoute sur l'addresse ADDRESS")
    print("\t -l | --log-level LEVEL : Affiche les log à partir de LEVEL parmis: DEBUG, INFO, WARN, ERROR, CRITICAL")
    print("\t -t | --thread-mod TYPE [ARG] : Change l'instanciation de la prise en charge des clients. ARG parmis")
    print("\t\t single : Un seul thread pour tout")
    print("\t\t spawn : Un thread pour l'écoute, et chaque client est géré par un nouveau thread qui se termine à la réponse")
    print("\t\t const N : Un thread pour l'écoute, et un nombre N de threads qui seront réutilisés pour gérer les clients")
    exit(-1)

if __name__ == "__main__":
    i = 1
    current = 0

    if len(sys.argv) > 2 and sys.argv[1] == "config":
        print(cfg[sys.argv[2]])
        exit(0)

    if len(sys.argv)>1 and sys.argv[1]=="backup-log":
        from http_server.log import BackupLog
        BackupLog.backup(cfg["log.filename"])
        exit(0)

    while i < len(sys.argv):
        arg = sys.argv[i]

        N = len(sys.argv)
        if arg.startswith("-"):
            if arg.startswith("--"):
                arg = arg[2:]
            else:
                arg = arg[1:]
            if arg in ["port", "p"]:
                if i+1>=N: print_help("Un numero de port doit être donné après '-%s'" % arg)
                cfg["listen.port"]=int(sys.argv[i+1])
                i+=1
            elif arg in ["address", "a"]:
                if i+1>=N: print_help("Une addresse doit être donnée après '-%s'" % arg)
                cfg["listen.address"]=sys.argv[i+1]
                i+=1
            elif arg in ["log-level", "l"]:
                if i+1>=N: print_help("Un niveau de log (parmis: DEBUG, INFO, WARN, ERROR, CRITICAL) doit être donnée après '-%s'" % arg)
                tmp = sys.argv[i+1].upper()
                if not tmp in ["DEBUG", "INFO", "WARN", "ERROR", "CRITICAL"]:
                    print_help('"%s" niveau de log inconnu (autorisés: "DEBUG", "INFO", "WARN", "ERROR", "CRITICAL")')
                cfg["log.level"] = tmp
                i+=1
            elif arg in ["thread-mod", "t"] and i+1>=N:
                if i+1>=N: print_help("'spawn', 'single' ou 'const' attendu après '-%s'" % arg)
                tmp = sys.argv[i+1].lower()
                if not tmp.lower() in ["single", "spawn", "const"]: print_help()
                cfg["server.mode"]=tmp
                i+=1
                if tmp=="const":
                    if i+1>=N:
                        try:
                            tmp=int(sys.argv[i+1])
                        except:
                            print_help("Un nombre de thread doit être donnée après const")

                        cfg["server.n_threads"]=tmp
                        i+=1
                    else: print("Un numero de port doit être donné après '-%s const'" % sys.argv[i-1])
        i += 1


    from server import Server
    server = Server()
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    server.listen(cfg["listen.port"])
