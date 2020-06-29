#!/bin/bash

preReleaseNumber=$1

major=$(echo $preReleaseNumber | sed 's/^\([0-9]*\)\.\([0-9]*\)\.\([0-9]*\)$/\1/g')
minor=$(echo $preReleaseNumber | sed 's/^\([0-9]*\)\.\([0-9]*\)\.\([0-9]*\)$/\2/g')
patch=$(echo $preReleaseNumber | sed 's/^\([0-9]*\)\.\([0-9]*\)\.\([0-9]*\)$/\3/g')

case $2 in
patch)
  patch=$((patch + 1))
  printf "$major.$minor.$patch"
  ;;
minor)
  patch=0
  minor=$((minor + 1))
  printf "$major.$minor.$patch"
  ;;
major)
  patch=0
  minor=0
  major=$(($major + 1))
  printf "$major.$minor.$patch"
  ;;
esac
