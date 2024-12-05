#!/bin/bash
echo "configura o nvm"
[[ -s /home/ec2-user/.nvm/nvm.sh ]] && . /home/ec2-user/.nvm/nvm.sh

echo "instala a versão do node necessária"
nvm install v22.0.0 || exit 10

echo "seta a configuração da versão do node"
nvm use v22.0.0 || exit 11
echo "node version: $(node -v)"

npm install yarn -g

yarn install
yarn build
yarn start

