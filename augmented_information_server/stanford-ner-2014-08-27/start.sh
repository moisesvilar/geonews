#!/bin/sh
scriptdir=`dirname $0`

java -mx500m -cp "$scriptdir/stanford-ner-with-spanish-classifier.jar:" edu.stanford.nlp.ie.NERServer -port 9191 -loadClassifier "$scriptdir/classifiers/spanish.ancora.distsim.s512.crf.ser.gz:"