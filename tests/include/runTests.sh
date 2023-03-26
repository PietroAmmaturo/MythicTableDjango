#!/bin/bash

# load in list of tests to run and remove blank lines and comments
# (note: you can not have # in test names)
TESTS=`sed -e "s/#.*//" -e "/^$/d" /opt/gatling/conf/testsToRun.list`

for TEST in $TESTS
do
	gatling.sh -s $TEST
done
