#!/bin/sh

cd "$(dirname $0)"

docker build . -t worldengine

TARGER="/$(pwd)/../resources/gen/"

echo ''
echo '---------------------------'
echo 'Running worldengine'
echo ''
echo "PNGs will be output in the $TARGER directory"
echo '---------------------------'
echo ''

docker run -v $TARGER:/tmp -it worldengine python worldengine -n world  -q 15 --export-datatype float32 -v --gs -r --ice --sat --scatter -x 2048 -y 1024 -o //tmp