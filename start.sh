#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $DIR
export PYTHONPATH="$PYTHONPATH:../libs/python"
python3  server.py 8081 > covid.log &

