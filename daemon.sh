#!/bin/bash

LIBS_PATH=../libs/python
export PYTHONPATH=$PYTHONPATH:$LIBS_PATH

PID_FILE=covid.pid
PYTHON_MAIN=main.py
PYTHON_MAIN_ARGS=8081
PYTHON=python3
LOGFILE=$($PYTHON $PYTHON_MAIN config log.filename)



cd "$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

function fct_start {
  $PYTHON $PYTHON_MAIN backup-log
	nohup $PYTHON -u  $PYTHON_MAIN $PYTHON_MAIN_ARGS > $LOGFILE 2>&1 &
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

function fct_pid {
	cat $PID_FILE
}

function fct_alive {
  kill -0 $(fct_pid) 2> /dev/null
  ret=$?
	if [ $ret -eq 0 ]; then
	  echo "true"
	  exit 0
	else
	  echo "false"
	  exit -1
  fi
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
elif [[ "$1" == "pid" ]]; then
	fct_pid
elif [[ "$1" == "alive" ]]; then
	fct_alive
else
	echo "Error on command line: $*"
	exit 1
fi

