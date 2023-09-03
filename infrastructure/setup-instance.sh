#!/bin/sh
set -e

sudo apt update
sudo apt upgrade -y

# install nodejs repo
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

sudo apt install nodejs jq curl -y

# create app & github users
sudo useradd --system --create-home --shell /usr/sbin/nologin app
sudo useradd -g app --no-create-home --no-user-group --home-dir /home/app --shell /bin/bash github
sudo usermod --append --groups app github

# deploy app
repo="SarahAbuirmeileh/Hackathon"
download_url=$(curl "https://api.github.com/repos/$repo/releases/latest" | jq --raw-output '.assets[0].browser_download_url')

curl -O "https://raw.githubusercontent.com/$repo/main/infrastructure/app.service"
sudo mv app.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable app.service

sudo -u app sh -c "mkdir -p /home/app/app && cd /home/app/app && curl -LO $download_url  && tar xzvf app.tar.gz  && npm install --omit=dev"
sudo -u app sh -c "echo AccessKey=AKIA3SQWPZW4UHNPBLPY > /home/app/app/.env"
sudo -u app sh -c "echo SecretAccessKey=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  > /home/app/app/.env"
sudo reboot
