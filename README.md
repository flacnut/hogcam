# Hog-Cam

Some simple node.js based scripts for recording my hedge-hogs running around at night.

## What do I need?
 - Raspberry Pi 2
 - Raspberry No-IR camera
 - Wi-Pi or some kind of network connection.
 - Somewhere to store the videos (i mounted my NAS).

## Setup
 - Flash regular Raspbian onto an SD card (not Noobs) and boot it up. I used a tool called 'rufus' to do this on windows.
 - Run ```raspi-config``` to the camera on.
 - Clone this repo into the ```~/``` home directory.
 - Run ```sudo apt-get update && sudo apt-get upgrade```
 
#### Get Node
From the [node docs](https://nodejs.org/en/download/package-manager/): 
```bash
curl -sL https://deb.nodesource.com/setup_5.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Mount storage
I mounted my network storage solution, you can do that by adding this to ```/etc/fstab```
```
//<ip>/<share> /mnt/nas-videos cifs username=<someuser>,password=<password>  0  0
```

#### Install PM2
Use sudo so it can be installed globaly.
```bash
sudo npm install -g pm2
```
Then lets add PM2 to run on startup
```bash
sudo pm2 startup ubuntu
```
This will ask you to run a more specific command. Copy and paste this command.

#### Auto-start Hogcam
PM2 is now going to start when the pi boots up, so we can piggy-back by auto starting hogcam when PM2 starts:
```bash
pi@raspberrypi:~/hogcam $ pm2 start ~/hogcam/index.js --name="hogcam" --watch
[PM2] Starting /home/pi/hogcam/index.js in fork_mode (1 instance)
[PM2] Done.
┌──────────┬────┬──────┬─────┬────────┬─────────┬────────┬─────────────┬──────────┐
│ App name │ id │ mode │ pid │ status │ restart │ uptime │ memory      │ watching │
├──────────┼────┼──────┼─────┼────────┼─────────┼────────┼─────────────┼──────────┤
│ hogcam   │ 0  │ fork │ 836 │ online │ 0       │ 0s     │ 17.605 MB   │  enabled │
└──────────┴────┴──────┴─────┴────────┴─────────┴────────┴─────────────┴──────────┘
 Use `pm2 show <id|name>` to get more details about an app
```

I've enabled ```--watch``` here so I can edit ```index.js``` and refresh the service faster. You don't necessarily need to do this.

This process is now configured to restart whenever it crashes or stops. Finally we need to save the PM2 state so that the process resumes on restart of the raspberry pi.
```bash
pm2 save
```
