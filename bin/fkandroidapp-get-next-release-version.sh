#!/bin/bash

currentReleaseVersion=$1

versionCode=$(echo $currentReleaseVersion | sed 's/^\([0-9]*\.[0-9]*\)\.\([0-9]*\)$/\1/g')
oldMajor=$(echo $currentReleaseVersion | sed 's/^\([0-9]*\)\.\([0-9]*\)\.\([0-9]*\)$/\1/g')
oldMinor=$(echo $currentReleaseVersion | sed 's/^\([0-9]*\)\.\([0-9]*\)\.\([0-9]*\)$/\2/g')
versoinName=$(echo $currentReleaseVersion | sed 's/^\([0-9]*\)\.\([0-9]*\)\.\([0-9]*\)$/\3/g')

case $2 in
patch)
  patch=$((versoinName + 1))
  printf "$versionCode.$patch"
  ;;
minor)
  replace=00
  minor1=`echo $versoinName | sed "s/[0-9]\{2\}$/${replace}/"`
  minor=$((minor1 + 100))
  printf "$versionCode.$minor"
  ;;
major)
  replace=0000
  minor2=`echo $versoinName | sed "s/[0-9]\{4\}$/${replace}/"`
  minor=$((minor2 + 10000))

  major=$((oldMajor + 1))
  printf "$major.0.$minor"
  ;;
esac
