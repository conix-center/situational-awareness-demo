var child_process = require('child_process');
var fs            = require('fs');
var ini           = require('ini');
var mqtt          = require('mqtt');
var addr          = require('os').networkInterfaces();

var parsed_data   = []; 
var index         = 0; 

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

try {
    var stream_input_file = fs.readFileSync("./drone.csv", 'utf-8');
    var lines = stream_input_file.split(/\r?\n/); 

    for (var i = 0; i < lines.length; ++i) {
        var line = lines[i].split(","); 
        var curr = {}; 
        var skip = false; 
        for (var j = 0; j < line.length; ++j) {
            if (isNaN(parseInt(line[j], 10))) {
                // this line is invalid
                skip = true;
                break;  
            }
        }

        if (skip) continue; 

        curr["frame"]       = parseInt(line[0], 10);
        curr["timestamp"]   = parseFloat(line[1]); 
        curr["rotation"]    = {"x": parseFloat(line[2]), "y": parseFloat(line[3]), "z": parseFloat(line[4]), "w": parseFloat(line[5])}; 
        curr["position"]    = {"x": parseFloat(line[6]), "y": parseFloat(line[7]), "z": parseFloat(line[8])}; 

        parsed_data.push(curr); 
    }
} catch (e) {
    console.log(e)
    console.log('Invalid input file.');
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

    /*
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
    */
    if (parsed_data.length <= index) {
        return {}; 
    }

    return parsed_data[index++];
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
    console.log(to_send);

    mqtt_outgoing.publish('sensor', JSON.stringify(to_send), function(error) {
        console.log('MQTT Error Publishing:' + error)
    });

}, 4);

