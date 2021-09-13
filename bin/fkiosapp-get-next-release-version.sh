#!/bin/bash

preReleaseNumber=$1

major=$(echo $preReleaseNumber | sed 's/^\([0-9]*\)\.\([0-9]*\)\.\([0-9]*\)(\([0-9]*\))$/\1/g')
minor=$(echo $preReleaseNumber | sed 's/^\([0-9]*\)\.\([0-9]*\)\.\([0-9]*\)(\([0-9]*\))$/\2/g')
patch=$(echo $preReleaseNumber | sed 's/^\([0-9]*\)\.\([0-9]*\)\.\([0-9]*\)(\([0-9]*\))$/\3/g')
buildNo=$(echo $preReleaseNumber | sed 's/^\([0-9]*\)\.\([0-9]*\)\.\([0-9]*\)(\([0-9]*\))$/\4/g')

case $2 in
nightly)
  if [ $buildNo -le 20 ]; then buildNo=21; else buildNo=$((buildNo + 1)); fi
  printf "$major.$minor.$patch($buildNo)"
  ;;
patch)
  buildNo=$((buildNo + 1))
  printf "$major.$minor.$patch($buildNo)"
  ;;
hotfix)
  patch=$((patch + 1))
  buildNo=1
  printf "$major.$minor.$patch($buildNo)"
  ;;
minor)
  patch=1
  buildNo=1
  minor=$((minor + 1))
  printf "$major.$minor.$patch($buildNo)"
  ;;
major)
  patch=1
  minor=1
  buildNo=1
  major=$(($major + 1))
  printf "$major.$minor.$patch($buildNo)"
  ;;
esac
