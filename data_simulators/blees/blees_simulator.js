var child_process = require('child_process');
var fs            = require('fs');
var ini           = require('ini');
var mqtt          = require('mqtt');
var addr          = require('os').networkInterfaces();

var mqtt_conf_file_location = '';
if(process.argv.length < 4) {
    mqtt_conf_file_location = './mqtt.conf';
} else {
    mqtt_conf_file_location = process.argv[2];
}

try {
    var mqtt_config_file = fs.readFileSync(mqtt_conf_file_location, 'utf-8');
    var mqtt_config = ini.parse(mqtt_config_file);
    if(mqtt_config.port == undefined ||
        mqtt_config.protocol == undefined ||
        mqtt_config.host == undefined) {
        console.log('Invalid configuration file. See mqtt.conf for valid configuration files');
        process.exit(1);
    }
} catch (e) {console.log(e)
    console.log('No configuration file found. Either pass a configuration path or place a file at ./mqtt.conf.');
    process.exit(1);
}

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

var last_out = {
    device: 'BLEES',
    pressure_pascals: 100000,
    humidity_percent: 50,
    temperature_celcius: 20,
    light_lux: 500,
    acceleration_advertisement: 1,
    acceleration_interval: 1,
    sequence_number: 0,
};

function generate_blees_packet() {

    var press = last_out.pressure_pascals + getRandom(-1,1);
    if(press < 99000) {
        press = 99000;
    } else if (press > 105000) {
        press = 105000;
    }

    var humid = last_out.humidity_percent + getRandom(-0.1,0.1);
    if(humid < 10) {
        humid = 10;
    } else if (humid > 95) {
        humid = 95;
    }

    var temp = last_out.temperature_celcius + getRandom(-0.01,0.01);
    if(temp < 16) {
        temp = 16;
    } else if (temp > 25) {
        temp = 25;
    }

    var light = last_out.light_lux + getRandom(-20,20);
    if(light < 0) {
        light = 0;
    } else if (light > 1000) {
        light = 1000;
    }

    var seq = ++last_out.sequence_number;
    if(seq > 255) {
        seq = 0;
    }

    var out = {
        device: 'BLEES',
        pressure_pascals: press,
        humidity_percent: humid,
        temperature_celcius: temp,
        light_lux: light,
        acceleration_advertisement: getRandom(-1,1),
        acceleration_interval: getRandom(0,1),
        sequence_number: seq,
        _meta: {
            received_time: new Date().toISOString(),
            device_id: 'c098e5300010',
            receiver: 'ble_gateway',
            gateway_id: 'c098e5c0000a',
        }
    };
    
    last_out = out;

    var ret = out;
    ret.pressure_pascals = Math.round(ret.pressure_pascals);
    ret.humidity_percent = Math.round(ret.humidity_percent);
    ret.temperature_celcius = Math.round(ret.temperature_celcius);
    ret.light_lux = Math.round(ret.light_lux);
    return ret;
}

var mqtt_outgoing = mqtt.connect(mqtt_config.protocol + '://' + mqtt_config.host + ':' + mqtt_config.port);

mqtt_outgoing.on('connect', function() {
    console.log("Connected to MQTT Broker");
});

mqtt_outgoing.on('error', function(err) {
    console.log("MQTT ERROR:" + err);
});

setInterval(function() {
    var to_send = generate_blees_packet();
    console.log(to_send)

    mqtt_outgoing.publish('blees', JSON.stringify(to_send), function(error) {
        console.log('MQTT Error Publishing:' + error)
    });

}, 200);
