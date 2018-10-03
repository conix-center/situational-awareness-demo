Situational Awareness Demo
==========================

This repository will hold the code and documentation for the year one
situational awareness demonstrator. The demonstrator consists for
four data flows:

1) A user will be wearing a Vive Pro headset.
2) The location and orientation of the user's VR headset will be tracked via OptiTrack.
3) A drone will be flying around the space being localized by OptiTrack.
4) On the drone will be a BLEES environmental sensor. It will send lux
readings to the MQTT broker
5) Unity and Drone Control will retrieve OptiTrack localization information via VRPN.

Using these data flows:

1) The drone will fly around collecting lux data (in a sweep or random walk)
while avoiding the user.
2) The user will walk around the space wearing the AR/VR headset. The headset
will visualize both the drone and lux data collected by
the light sensor.

This demo shows exhibits several key components of CONIX:

1) Drone control and obstacle avoidance
2) The coordination of multiple localization systems into a single coordinate space
3) The ability to visualize data in VR which simulates data that might
be found in a situation calling for enhanced perception/awareness
4) The standardization of data formats across multiple systems and platforms
from different research groups in CONIX.

https://drive.google.com/drive/folders/1y4srPMSgTwh8RA6ZHlJo0fPBpop5tfqM?usp=sharing
