/**
 * SCD30 block
 */
//%color=#444444 icon="\uf185" block="SCD30"
namespace SCD30 {
    
    let temperature: number = 0
    let humidity: number = 0
    let co2: number = 0
    
    control.inBackground(() => {
        enableContinuousMeasurement()
        while (true) {
            readMeasurement()
        }
    })
    
    function enableContinuousMeasurement(): void{
        let commandBuffer = pins.createBuffer(5)

        commandBuffer[0] = 0x00 
        commandBuffer[1] = 0x10 
        commandBuffer[2] = 0x00 
        commandBuffer[3] = 0x00 
        commandBuffer[4] = 0x81

        pins.i2cWriteBuffer(0x61, commandBuffer, false)
    }

    function readReady(): boolean{
        let buf = pins.createBuffer(3)
        pins.i2cWriteNumber(0x61, 0x0202, NumberFormat.UInt16BE,false)
        basic.pause(10)
        buf = pins.i2cReadBuffer(0x61, 3, false)
        let res = buf[0]<<8 + buf[1]

        if(buf[1] == 1){
            return true
        }else{
            return false
        }
    }

    function readMeasurement(): void{
        while(readReady() == false){
            //serial.writeLine("waiting in: readMeasurement()")
        }
        let buf = pins.createBuffer(18)
        let tbuf = pins.createBuffer(4)
        pins.i2cWriteNumber(0x61, 0x0300, NumberFormat.UInt16BE, false)
        basic.pause(10)
        buf = pins.i2cReadBuffer(0x61, 18, false)
        
        //co2
        tbuf.setNumber(NumberFormat.Int8LE, 0, buf.getNumber(NumberFormat.UInt8LE, 0))
        tbuf.setNumber(NumberFormat.Int8LE, 1, buf.getNumber(NumberFormat.UInt8LE, 1))
        tbuf.setNumber(NumberFormat.Int8LE, 3, buf.getNumber(NumberFormat.UInt8LE, 3))
        tbuf.setNumber(NumberFormat.Int8LE, 4, buf.getNumber(NumberFormat.UInt8LE, 4))
        co2 = tbuf.getNumber(NumberFormat.Float32BE, 0)
        co2 = Math.round(co2*100)/100

        //temperature
        tbuf.setNumber(NumberFormat.Int8LE, 0, buf.getNumber(NumberFormat.UInt8LE, 6))
        tbuf.setNumber(NumberFormat.Int8LE, 1, buf.getNumber(NumberFormat.UInt8LE, 7))
        tbuf.setNumber(NumberFormat.Int8LE, 3, buf.getNumber(NumberFormat.UInt8LE, 9))
        tbuf.setNumber(NumberFormat.Int8LE, 4, buf.getNumber(NumberFormat.UInt8LE, 10))
        temperature = tbuf.getNumber(NumberFormat.Float32BE, 0)
        temperature = Math.round(temperature*100)/100

        //humidity
        tbuf.setNumber(NumberFormat.Int8LE, 0, buf.getNumber(NumberFormat.UInt8LE, 12))
        tbuf.setNumber(NumberFormat.Int8LE, 1, buf.getNumber(NumberFormat.UInt8LE, 13))
        tbuf.setNumber(NumberFormat.Int8LE, 3, buf.getNumber(NumberFormat.UInt8LE, 15))
        tbuf.setNumber(NumberFormat.Int8LE, 4, buf.getNumber(NumberFormat.UInt8LE, 16))
        humidity = tbuf.getNumber(NumberFormat.Float32BE, 0)
        humidity = Math.round(humidity*100)/100
    }

    /**
     * Reads CO2
     */
    //% weight=87 blockGap=8
    //% block="Read CO2" 
    //% blockId=read_CO2
    export function readCO2(): number{
        return co2
    }

    /**
     * Reads Temperature
     */
    //% weight=87 blockGap=8
    //% block="Read Temperature" 
    //% blockId=read_Temperature
    export function readTemperature(): number{
        return temperature
    }

    /**
     * Reads Humidity
     */
    //% weight=87 blockGap=8
    //% block="Read Humidity" 
    //% blockId=read_Humidity
    export function readHumidity(): number{
        return humidity
    }
} 
