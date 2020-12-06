import { Entity, u } from "../index";
import { format } from 'date-fns'

enum DateTimeComponent {
    UnixMillis = "unix",
    ISO = "iso",
    Local = "local",
    LocalTime = "l_time",
    LocalDate = "l_date",
    LocalMillisecond = "l_ms",
    LocalSecond = "l_s",
    LocalMinute = "l_M",
    LocalHour = "l_h",
    LocalDayOfMonth = "l_d",
    LocalMonth = "l_m",
    LocalYear = "l_y",
    LocalDayOfWeek = "l_wd",
    UTC = "utc",
    UTCTime = "u_time",
    UTCDate = "u_date",
    UTCMillisecond = "u_ms",
    UTCSecond = "u_s",
    UTCMinute = "u_m",
    UTCHour = "u_h",
    UTCDayOfMonth = "u_d",
    UTCMonth = "u_M",
    UTCYear = "u_y",
    UTCDayOfWeek = "u_wd"
}

export class DateTime extends Entity{

    private static readonly dtBeginRegExp: RegExp = /^\/?dt\/(.*)/;
    private static readonly validDtRegExp: RegExp = /^(\/?dt\/)((local|utc)(\(([^()]*)\))?|unix|iso|l_time|l_date|l_ms|l_s|l_M|l_h|l_d|l_m|l_y|l_wd|u_time|u_date|u_ms|u_s|u_m|u_h|u_d|u_M|u_y|u_wd)$/;

    public constructor(parent: Entity){
        super(undefined, parent);
    }

    public static isDTExpr(str: string): boolean {
        return str.match(this.dtBeginRegExp) != undefined;
    }

    public static isValidDTExpr(str: string): boolean {
        return str.match(this.validDtRegExp) != undefined;
    }

    public get(dtExpr: string){

        if(!DateTime.isValidDTExpr(dtExpr)){
            u.fatal("Invalid Datetime expression: " + dtExpr, this.getFullPath());
        }

        let local = new Date();

        let dtComponent = '';
        let formatStr = dtExpr.replace(DateTime.validDtRegExp, "$5");
        
        if(formatStr == ''){
            dtComponent = dtExpr.replace(DateTime.validDtRegExp, "$2");
        }else{
            dtComponent = dtExpr.replace(DateTime.validDtRegExp, "$3");
            try{
                if(dtComponent == DateTimeComponent.Local){
                    return format(local, formatStr);
                }else{
                    return format(new Date(local.getTime() + local.getTimezoneOffset() * 60000), formatStr);
                }
            }catch(err){
                u.fatal(err.message, this.getFullPath());
            }                        
        }

        switch(dtComponent){
            case DateTimeComponent.UnixMillis:
                return Date.now();
            case DateTimeComponent.ISO:
                return local.toISOString();
            case DateTimeComponent.Local:
                return local.toLocaleString();
            case DateTimeComponent.LocalTime:
                return local.toTimeString();
            case DateTimeComponent.LocalDate:
                return local.toDateString();
            case DateTimeComponent.LocalMillisecond:
                return local.getMilliseconds();
            case DateTimeComponent.LocalSecond:
                return local.getSeconds();
            case DateTimeComponent.LocalMinute:
                return local.getMinutes();
            case DateTimeComponent.LocalHour:
                return local.getHours();
            case DateTimeComponent.LocalDayOfMonth:
                return local.getDate();
            case DateTimeComponent.LocalMonth:
                return local.getMonth() + 1;
            case DateTimeComponent.LocalYear:
                return local.getFullYear();
            case DateTimeComponent.LocalDayOfWeek:
                return local.getDay();
            case DateTimeComponent.UTC:
                return local.toUTCString();
            case DateTimeComponent.UTCTime:
                return new Date(local.getTime() + local.getTimezoneOffset() * 60000)
                    .toTimeString();
            case DateTimeComponent.UTCDate:
                return new Date(local.getTime() + local.getTimezoneOffset() * 60000)
                    .toDateString();
            case DateTimeComponent.UTCMillisecond:
                return local.getUTCMilliseconds();
            case DateTimeComponent.UTCSecond:
                return local.getUTCSeconds();
            case DateTimeComponent.UTCMinute:
                return local.getUTCMinutes();
            case DateTimeComponent.UTCHour:
                return local.getUTCHours();
            case DateTimeComponent.UTCDayOfMonth:
                return local.getUTCDate();
            case DateTimeComponent.UTCMonth:
                return local.getUTCMonth() + 1;
            case DateTimeComponent.UTCYear:
                return local.getUTCFullYear();
            case DateTimeComponent.UTCDayOfWeek:
                return local.getUTCDay();
        }

        return undefined;
    }
}

