# AWS deploy

[Deploying Docker containers with AWS EC2 Instance. | by Mallireddy Chandu Priya | Medium](https://medium.com/@chandupriya93/deploying-docker-containers-with-aws-ec2-instance-265038bba674)

Create new ec2 instance
Using linux x62, 2 cores, 8GB
Ssh, http, https anywhere
Download .pem file and set permissions to it with
`sudo chmod 600 eduvault-ec2.pem`
Then can be added to viscose remote config

```
Host aws-eduvault-root
  HostName ec2-3-14-125-104.us-east-2.compute.amazonaws.com
  User ec2-user
  IdentityFile ~/Documents/GitHub/EduVault/eduvault/eduvault-ec2.pem
  UseKeychain yes
  ServerAliveInterval 50
  TCPKeepAlive no

```

[How to set up a custom domain for your EC2 instance without using Route53 - DEV Community](https://dev.to/maybebored/how-to-set-up-a-custom-domain-for-your-ec2-instance-without-using-route53-f9)

Network and security (sidebar) > elastic IPs

Allocate

Associate > select instance

## docker

```bash
sudo amazon-linux-extras install docker
sudo yum install docker
sudo usermod -a -G docker ec2-user
# reboot instance

# latest docker-compose
sudo curl -L https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
# Verify success:
docker-compose version

#start
sudo service docker start

```

[Namecheap, Cloudflare, Amazon EC2 - CodeOmitted](http://codeomitted.com/namecheap-cloudflare-amazon-ec2/)

1. Login to your cloudflare account.
2. From the top menu, click add site.
3. Enter your register domain and click scan button.
4. After scanning complete, it will show you DNS form.
5. If the form didn’t appear click from the DNS icon from the top menu.
6. As for this tutorial, we only use A and CNAME
7. Enter the following information:
   A: Name = xxx.com Value = Your public IP
   CNAME: Name = www Value = Your public DNS
8. Finally click the orange cloud icon on the status column to establish the connection.

[image:6FD1B53C-2595-4F60-B07E-75BE8695F3D2-35891-000000ECD69EF533/Screen Shot 2021-04-14 at 12.03.41 PM.png]
… actually changed to DNS only

Login to your namecheap account 2. Select your domain and click edit selected. 3. Select Domain name server setup from the left menu. 4. Select the option Specify Custom DNS Servers ( Your own DNS Servers ) 5. Enter the following dns and remove the rest and you’ve done.
elliot.ns.cloudflare.com
malavika.ns.cloudflare.com
[image:8113366C-178B-4030-997C-23DBF2A2DFFB-35891-000000ECFDE03843/Screen-Shot-2015-09-24-at-10.02.27-AM.png]

wait….

## git

```bash
sudo yum -y install git-core

mkdir code
cd code
mkdir eduvault
cd eduvault
# make eduvault folder then
git init
git remote add origin https://github.com/EduVault/eduvault.git
# on subsequent refreshes
git fetch origin
# git reset --mixed origin/main #will not remove any local files
git reset --hard origin/main #will remove any local files.
git checkout origin/main -ft
```

## node

```bash
# nvm
sudo yum install curl -y
curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
source ~/.bashrc

nvm install 12.22.1
npm i -g yarn
```

## prod set up

```bash
# certbot
sudo yum install -y https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm
sudo yum install certbot -y
## copy env file in
yarn make-prod-certs #runs certbot. could also just copy existing certs.
# requires manual confirmation in terminal
yarn copy-prod-certs


# If docker images have been build with the right domain name, simply
sudo service docker start

## problem: env files aren't being loaded in AWS. - need to use aws secrets management, might also need to update the docker-copmpose files
## problem 2: how to get the certs on aws if we are using ci

yarn production # runs docker-compose up -f prod-...yml

# else rebuild docker images with correct domain:
yarn d-build # need to be signed in as me. (or change the image links in the docker-compose files     image: docker.io/eduvault/eduvault_example:latest)
```

Refactor to make dev, staging, prod builds super easy and with no manual changes except for changing the staging/prod server host in the env file

EduVault CI goals:

1. deploys on aws automatically from commits to main on github
2. Have elastic scalable load balancing
3. Have ssl with custom domain
4. (Bonus) auto renew certs

Problems:

1. Aws is not loading env files with dotenv or the docker-compose env_file.
   1. Aws secrets manager?
2. Certs cannot be generated without manual confirmation
   1. Make a efs volume to feed these certs?
3. Make all references to ports based on env.

Feed the certs to

```yaml
# docker-compose-prod.yml
nginx:
  container_name: nginx-proxy
  image: jwilder/nginx-proxy
  restart: unless-stopped
  volumes:
    - /var/run/docker.sock:/tmp/docker.sock:ro
    - ./deploy/prod-certs:/etc/nginx/certs:ro
```

## Run detached

```
# keep running with screen
sudo apt install screen
screen
# Now you can browse your two screen sessions by running
screen -ls

# To detach a screen session and return to your normal SSH terminal, type
Ctrl a d

To reconnect to one of these sessions, run
screen -r 2477.pts-0.server1
```
