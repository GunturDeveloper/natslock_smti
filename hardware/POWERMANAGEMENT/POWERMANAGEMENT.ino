#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Arduino.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <DHT.h>

const char* ssid = "Natslock";   // Ganti dengan SSID WiFi Anda
const char* password = "madeByXITMA";  // Ganti dengan password WiFi Anda
const int DelayLoop = 2000;

//Voltage Sens
#define SensPSU 34
#define SensBAT 35
#define SensOUT 32

//Relay Output
#define POWERbyPSU 33
#define POWERbyBAT 25
#define POWERtoOUT 26
 
//=========[ FAN PIN CONTROLLER ]=========//
#define FAN1A 22
#define FAN1B 23
#define ENA1 27 //ALANOG 

#define ENA2 14 //ALANOG 
#define FAN2A 12
#define FAN2B 13

//=======[ TEMPERATURE SENSOR ]========//
#define TEMP_1 36 //VP
#define TEMP_2 21 //VN
#define DHTPIN 2
#define DHTTYPE DHT22

//=======[ LAMP INDICATOR ]========//
#define PL_RED 19
#define PL_YELLOW 18
#define PL_GREEN 5
#define PL_BLUE 4

//=======[OBSTACLE SENSOR FOR DOOR]=======//
#define OBSTACLE 15

//RELAY LED STRIP
#define LEDSTRIP 16 //RX2

OneWire oneWire_1(TEMP_1);
OneWire oneWire_2(TEMP_2);
DallasTemperature DS18B20_1(&oneWire_1);
DallasTemperature DS18B20_2(&oneWire_2);
DHT dht(DHTPIN, DHTTYPE);

float VSensPSU = 0.0;  //nilai masukan sensor
float VSensBAT = 0.0;  //nilai masukan sensor
float VSensOUT = 0.0;  //nilai masukan sensor

float hasilSensPSU = 0.0;  //nilai hasil rumus
float hasilSensBAT = 0.0;  //nilai hasil rumus
float hasilSensOUT = 0.0;  //nilai hasil rumus

float triggerVoltage = 10.0;

String StrSensPSU;
String StrSensBAT;
String StrSensOUT;
String APIHealt;

float R1 = 30000.0;  //30k ohm resistor (sesuai dengan nilai resistor di sensor)
float R2 = 7500.0;   //7.5k ohm resistor (sesuai dengan nilai resistor di sensor)

float tempC_1;
float tempC_2;
float tempF_1;
float tempF_2;
float tempC_3;
float humidity;

//====[FAN VARIABLE]====//
bool PowerFan1 = false;
bool PowerFan2 = false;
float analogFan1;
float analogFan2;

//DOOR BOX VALUE
bool valueobs;
String Strobs;

String StempC_1;
String StempC_2;
String StempF_1;
String StempF_2;
String StempC_3;
String Shumidity;

void setup() {
  Serial.begin(115200);  //mengaktifkan serial monitor di 115200
  connectWifi();
  pinMode(SensPSU, INPUT);
  pinMode(SensBAT, INPUT);
  pinMode(SensOUT, INPUT);
  pinMode(POWERbyPSU, OUTPUT);
  pinMode(POWERbyBAT, OUTPUT);
  pinMode(POWERtoOUT, OUTPUT);
  pinMode(PL_RED, OUTPUT);
  pinMode(PL_YELLOW, OUTPUT);
  pinMode(PL_GREEN, OUTPUT);
  pinMode(PL_BLUE, OUTPUT);
  //Serial.println("Pengukuran tegangan DC");

  //Idle LED_RED
  digitalWrite(PL_RED, LOW);

  //PINMODE FAN CONTROLLER
  pinMode(FAN1A, OUTPUT);
  pinMode(FAN1B, OUTPUT);
  pinMode(ENA1, OUTPUT);
  pinMode(FAN2A, OUTPUT);
  pinMode(FAN2B, OUTPUT);
  pinMode(ENA2, OUTPUT);

  //PIN MODE DHT
  pinMode(DHTPIN, INPUT);

  //PIN MODE DOOR SYSTEM
  pinMode(OBSTACLE, INPUT);
  pinMode(LEDSTRIP, OUTPUT);

  //Begin Temp Sensor
  DS18B20_1.begin();
  DS18B20_2.begin();
  dht.begin();
}

void loop() {
  readVoltageBAT();
  readVoltagePSU();
  readVoltageOUT();
  ApiNeedSystem();
  readTemp();
  readObs();

  if (hasilSensPSU < triggerVoltage) {
    useBAT();
  } else {
    usePSU();
  }

  if(APIHealt == "No"){
    return ErrLamp();
  }

  if(PowerFan1 == true){
    digitalWrite(FAN1A, HIGH);
    digitalWrite(FAN1B, LOW);
    analogWrite(ENA1, analogFan1);
  } else {
    digitalWrite(FAN1A, LOW);
    digitalWrite(FAN1B, LOW);
    analogWrite(ENA1, 0);
  }

  if(PowerFan2 == true){
    digitalWrite(FAN2A, HIGH);
    digitalWrite(FAN2B, LOW);
    analogWrite(ENA2, analogFan2);
  } else {
    digitalWrite(FAN2A, LOW);
    digitalWrite(FAN2B, LOW);
    analogWrite(ENA2, 0);
  }

  delay(DelayLoop);
}

void connectWifi() {
  // Menghubungkan ke jaringan WiFi
  WiFi.begin(ssid, password);
  Serial.println("Connecting to WiFi...");

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
    digitalWrite(PL_YELLOW, HIGH); //LED YELLOW OFF, INTERNET OFF
  }

  Serial.println("Connected to the WiFi network");
  digitalWrite(PL_YELLOW, LOW); //LED YELLOW ON, INTERNET ON
}

void readVoltagePSU() {
  int nilaiTegangan = analogRead(SensPSU);     //pembacaan sensor
  VSensPSU = (nilaiTegangan * 5.0) / 1024.0;   //rumus mengubah nilai baca sensor
  hasilSensPSU = VSensPSU / (R2 / (R1 + R2));  //hasil akhir
  StrSensPSU = String(hasilSensPSU);
  ApiSensPSU(StrSensPSU);

  Serial.print("Besar Tegangan DC rangkaian = ");
  Serial.print(hasilSensPSU, 2);  //menuliskan hasil akhir pada monitor
  Serial.println("volt");
}

void readVoltageBAT() {
  int nilaiTegangan = analogRead(SensBAT);     //pembacaan sensor
  VSensBAT = (nilaiTegangan * 5.0) / 1024.0;   //rumus mengubah nilai baca sensor
  hasilSensBAT = VSensBAT / (R2 / (R1 + R2));  //hasil akhir
  StrSensBAT = String(hasilSensBAT);
  ApiSensBAT(StrSensBAT);

  Serial.print("Besar Tegangan DC rangkaian = ");
  Serial.print(hasilSensBAT, 2);  //menuliskan hasil akhir pada monitor
  Serial.println("volt");
}

void readVoltageOUT() {
  int nilaiTegangan = analogRead(SensOUT);     //pembacaan sensor
  VSensOUT = (nilaiTegangan * 5.0) / 1024.0;   //rumus mengubah nilai baca sensor
  hasilSensOUT = VSensOUT / (R2 / (R1 + R2));  //hasil akhir
  StrSensOUT = String(hasilSensOUT);
  ApiSensOUT(StrSensOUT);

  Serial.print("Besar Tegangan DC rangkaian = ");
  Serial.print(hasilSensOUT, 2);  //menuliskan hasil akhir pada monitor
  Serial.println("volt");
}

void readTemp(){
  DS18B20_1.requestTemperatures();       // send the command to get temperatures
  tempC_1 = DS18B20_1.getTempCByIndex(0);  // read temperature in °C
  tempF_1 = tempC_1 * 9 / 5 + 32; // convert °C to °F
  StempC_1 = String(tempC_1);  
  StempF_1 = String(tempF_1);

  DS18B20_2.requestTemperatures();       // send the command to get temperatures
  tempC_2 = DS18B20_2.getTempCByIndex(0);  // read temperature in °C
  tempF_2 = tempC_2 * 9 / 5 + 32; // convert °C to °F
  StempC_2 = String(tempC_2);
  StempF_2 = String(tempF_2);

  tempC_3 = dht.readTemperature();
  humidity = dht.readHumidity();
  StempC_3 = String(tempC_3);
  Shumidity = String(humidity);

  ApiSensTemp(StempC_1, StempF_1, StempC_2, StempF_2, StempC_3, Shumidity);
}

void ApiSensPSU(String StrSensPSU) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    // Lokasi URL API yang akan diminta
    String url = "http://natslock.my.id/api/system/locker/power/voltage/psu/" + StrSensPSU;

    Serial.print("Sending HTTP GET request to: ");
    Serial.println(url);

    // Menggunakan WiFiClient untuk memulai koneksi
    WiFiClient client;
    http.begin(client, url);

    int httpCode = http.GET();
    Serial.println(httpCode);
    if (httpCode == 502) {
      Serial.print("HTTP request failed with error code: ");
      Serial.println(httpCode);
      APIHealt = "No";
    }
    if (httpCode > 0) {
      // Penerimaan respon berhasil
      if (httpCode == HTTP_CODE_OK) {
        String payload = http.getString();
        Serial.println("Response payload:");
        Serial.println(payload);

        // Parsing JSON
        DynamicJsonDocument doc(1024);
        deserializeJson(doc, payload);
     
        // Mendapatkan nilai OnGoing.stats
        APIHealt = "Yes";
      }
    } else {
      Serial.print("HTTP request failed with error code: ");
      Serial.println(httpCode);
      APIHealt = "No";
    }

    // Menutup koneksi
    http.end();
  }
}

void ApiSensBAT(String StrSensBAT) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    // Lokasi URL API yang akan diminta
    String url = "http://natslock.my.id/api/system/locker/power/voltage/bat/" + StrSensBAT;

    Serial.print("Sending HTTP GET request to: ");
    Serial.println(url);

    // Menggunakan WiFiClient untuk memulai koneksi
    WiFiClient client;
    http.begin(client, url);

    int httpCode = http.GET();
    Serial.println(httpCode);
    if (httpCode == 502) {
      Serial.print("HTTP request failed with error code: ");
      Serial.println(httpCode);
      APIHealt = "No";
    }
    if (httpCode > 0) {
      // Penerimaan respon berhasil
      if (httpCode == HTTP_CODE_OK) {
        String payload = http.getString();
        Serial.println("Response payload:");
        Serial.println(payload);

        // Parsing JSON
        DynamicJsonDocument doc(1024);
        deserializeJson(doc, payload);

        // Mendapatkan nilai OnGoing.stats
        APIHealt = "Yes";
      }
    } else {
      Serial.print("HTTP request failed with error code: ");
      Serial.println(httpCode);
      APIHealt = "No";
    }

    // Menutup koneksi
    http.end();
  }
}

void ApiSensOUT(String StrSensOUT) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    // Lokasi URL API yang akan diminta
    String url = "http://natslock.my.id/api/system/locker/power/voltage/out/" + StrSensOUT;

    Serial.print("Sending HTTP GET request to: ");
    Serial.println(url);

    // Menggunakan WiFiClient untuk memulai koneksi
    WiFiClient client;
    http.begin(client, url);

    int httpCode = http.GET();
    Serial.println(httpCode);
    if (httpCode == 502) {
      Serial.print("HTTP request failed with error code: ");
      Serial.println(httpCode);
      APIHealt = "No";
    }
    if (httpCode > 0) {
      // Penerimaan respon berhasil
      if (httpCode == HTTP_CODE_OK) {
        String payload = http.getString();
        Serial.println("Response payload:");
        Serial.println(payload);

        // Parsing JSON
        DynamicJsonDocument doc(1024);
        deserializeJson(doc, payload);

        // Mendapatkan nilai OnGoing.stats
        APIHealt = "Yes";
      }
    } else {
      Serial.print("HTTP request failed with error code: ");
      Serial.println(httpCode);
      APIHealt = "No";
    }

    // Menutup koneksi
    http.end();
  }
}

void ApiSensTemp(String StempC_1, String StempF_1, String StempC_2, String StempF_2, String StempC_3, String Shumidity) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    // Lokasi URL API yang akan diminta
    String url = "http://natslock.my.id/api/system/locker/temperature/" + StempC_1 + "/" + StempF_1 + "/" + StempC_2 + "/" + StempF_2 + "/" + StempC_3 + "/" + Shumidity;

    Serial.print("Sending HTTP GET request to: ");
    Serial.println(url);

    // Menggunakan WiFiClient untuk memulai koneksi
    WiFiClient client;
    http.begin(client, url);

    int httpCode = http.GET();
    Serial.println(httpCode);
    if (httpCode == 502) {
      Serial.print("HTTP request failed with error code: ");
      Serial.println(httpCode);
      APIHealt = "No";
    }
    if (httpCode > 0) {
      // Penerimaan respon berhasil
      if (httpCode == HTTP_CODE_OK) {
        String payload = http.getString();
        Serial.println("Response payload:");
        Serial.println(payload);

        // Parsing JSON
        DynamicJsonDocument doc(1024);
        deserializeJson(doc, payload);

        // Mendapatkan nilai OnGoing.stats
        APIHealt = "Yes";
      }
    } else {
      Serial.print("HTTP request failed with error code: ");
      Serial.println(httpCode);
      APIHealt = "No";
    }

    // Menutup koneksi
    http.end();
  }
}

void ApiStatusR(String StrStats) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    // Lokasi URL API yang akan diminta
    String url = "http://natslock.my.id/api/system/locker/power/state/bat/" + StrStats;

    Serial.print("Sending HTTP GET request to: ");
    Serial.println(url);

    // Menggunakan WiFiClient untuk memulai koneksi
    WiFiClient client;
    http.begin(client, url);

    int httpCode = http.GET();
    Serial.println(httpCode);
    if (httpCode == 502) {
      Serial.print("HTTP request failed with error code: ");
      Serial.println(httpCode);
      APIHealt = "No";
    }
    if (httpCode > 0) {
      // Penerimaan respon berhasil
      if (httpCode == HTTP_CODE_OK) {
        String payload = http.getString();
        Serial.println("Response payload:");
        Serial.println(payload);

        // Parsing JSON
        DynamicJsonDocument doc(1024);
        deserializeJson(doc, payload);

        // Mendapatkan nilai OnGoing.stats
        APIHealt = "Yes";
      }
    } else {
      Serial.print("HTTP request failed with error code: ");
      Serial.println(httpCode);
      APIHealt = "No";
    }

    // Menutup koneksi
    http.end();
  }
}

void ApiNeedSystem() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    // Lokasi URL API yang akan diminta
    String url = "http://natslock.my.id/api/systemdb/all";

    Serial.print("Sending HTTP GET request to: ");
    Serial.println(url);

    // Menggunakan WiFiClient untuk memulai koneksi
    WiFiClient client;
    http.begin(client, url);

    int httpCode = http.GET();
    Serial.println(httpCode);
    if (httpCode == 502) {
      Serial.print("HTTP request failed with error code: ");
      Serial.println(httpCode);
      APIHealt = "No";
    }
    if (httpCode > 0) {
      // Penerimaan respon berhasil
      if (httpCode == HTTP_CODE_OK) {
        String payload = http.getString();
        Serial.println("Response payload:");
        Serial.println(payload);

        // Parsing JSON
        DynamicJsonDocument doc(1024);
        deserializeJson(doc, payload);

        PowerFan1 = doc["Main_Power"]["Fan_1"]["isTurnOn"].as<bool>();
        PowerFan2 = doc["Main_Power"]["Fan_2"]["isTurnOn"].as<bool>();
        analogFan1 = doc["Main_Power"]["Fan_1"]["Analog"].as<int>();
        analogFan2 = doc["Main_Power"]["Fan_2"]["Analog"].as<int>();

        // Mendapatkan nilai OnGoing.stats
        APIHealt = "Yes";
      }
    } else {
      Serial.print("HTTP request failed with error code: ");
      Serial.println(httpCode);
      APIHealt = "No";
    }

    // Menutup koneksi
    http.end();
  }
}

void usePSU() {
  digitalWrite(POWERbyPSU, LOW);
  digitalWrite(POWERbyBAT, LOW);
  digitalWrite(POWERtoOUT, LOW);
  ApiStatusR("off");

  //LED Green On
  digitalWrite(PL_GREEN, LOW);
  digitalWrite(PL_BLUE, HIGH);
}

void useBAT() {
  digitalWrite(POWERbyPSU, LOW);
  digitalWrite(POWERbyBAT, LOW);
  digitalWrite(POWERtoOUT, LOW);
  ApiStatusR("on");

  //LED Blue On
  digitalWrite(PL_GREEN, HIGH);
  digitalWrite(PL_BLUE, LOW);
}

void readObs() {
  valueobs = digitalRead(OBSTACLE);
  if (valueobs == 0) {
    String Strobs = "0";
    digitalWrite(LEDSTRIP, HIGH);
    // ApiObs(Strobs);
  } else {
    String Strobs = "1";
    digitalWrite(LEDSTRIP, LOW);
    // ApiObs(Strobs);
  }
  //Serial.println(valueobs);
}

void ErrLamp() {
  digitalWrite(PL_RED, HIGH);
  delay(300);
  digitalWrite(PL_RED, LOW);
  delay(300);
  digitalWrite(PL_RED, HIGH);
  delay(300);
  digitalWrite(PL_RED, LOW);
  delay(300);
  digitalWrite(PL_RED, HIGH);
  delay(300);
  digitalWrite(PL_RED, LOW);
  delay(300);
  digitalWrite(PL_RED, HIGH);
  delay(300);
  digitalWrite(PL_RED, LOW);
  delay(300);
  digitalWrite(PL_RED, HIGH);
  delay(300);
  digitalWrite(PL_RED, LOW);
  delay(300);
}