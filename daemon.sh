#!/bin/bash

PID_FILE=covid.pid
PYTHON_MAIN=server.py
PYTHON_MAIN_ARGS=8081
LOGFILE=covid.log
LIBS_PATH=../libs/python


export PYTHONPATH=$PYTHONPATH:$LIBS_PATH



cd "$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

function fct_start {
	nohup python3 -u  $PYTHON_MAIN $PYTHON_MAIN_ARGS > $LOGFILE 2>&1 &
	echo -n $! > $PID_FILE
}

function fct_stop {
	kill -15 $(cat $PID_FILE) || true
}

function fct_restart {
	fct_stop
	fct_start
}

function fct_update {
	fct_stop
	git pull
	fct_start
}

if [[ $# -eq 0 ]]; then
	fct_start
	exit 0
elif [[ "$1" == "start" ]]; then
	fct_start
	exit 0
elif [[ "$1" == "restart" ]]; then
	fct_restart
	exit 0
elif [[ "$1" == "stop" ]]; then
	fct_stop
	exit 0
elif [[ "$1" == "update" ]]; then
	fct_update
else
	echo "Error on command line: $*"
	exit 1
fi

