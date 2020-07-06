#!/bin/bash

currentReleaseVersion=$1

versionCode=$(echo $currentReleaseVersion | sed 's/^\([0-9]*\.[0-9]*\)\.\([0-9]*\)$/\1/g')
oldMajor=$(echo $currentReleaseVersion | sed 's/^\([0-9]*\)\.\([0-9]*\)\.\([0-9]*\)$/\1/g')
oldMinor=$(echo $currentReleaseVersion | sed 's/^\([0-9]*\)\.\([0-9]*\)\.\([0-9]*\)$/\2/g')
versoinName=$(echo $currentReleaseVersion | sed 's/^\([0-9]*\)\.\([0-9]*\)\.\([0-9]*\)$/\3/g')

case $2 in
patch)
  newVersoinName=$((versoinName + 1))
  printf "${versionCode}.${newVersoinName}"
  ;;
minor)
  replace=00
  newVersoinName=`echo $versoinName | sed "s/[0-9]\{2\}$/${replace}/"`
  newVersoinName=$((newVersoinName + 100))
  printf "${versionCode}.${newVersoinName}"
  ;;
major)
  replace=0000
  newVersoinName=`echo $versoinName | sed "s/[0-9]\{4\}$/${replace}/"`
  newVersoinName=$((newVersoinName + 10000))

  if [ ${oldMinor} -lt 9 ]
  then
    minor=$((oldMinor + 1))
    printf "${oldMajor}.${minor}.${newVersoinName}"
  else
    major=$((oldMajor + 1))
    printf "${major}.0.${newVersoinName}"
  fi
  ;;
esac
