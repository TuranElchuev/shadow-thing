import { Entity, u } from "../index";

require("./dateFormat.js");


enum DateTimeComponent {
    UnixMillis = "unix",
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
    private static readonly validDtRegExp: RegExp = /^(\/?dt\/)((local|utc)(\(([^()]*)\))?|unix|l_time|l_date|l_ms|l_s|l_M|l_h|l_d|l_m|l_y|l_wd|u_time|u_date|u_ms|u_s|u_m|u_h|u_d|u_M|u_y|u_wd)$/;

    public constructor(parent: Entity){
        super(undefined, parent);
    }

    public static isDTExpr(expr: string): boolean {
        return expr.match(this.dtBeginRegExp) != undefined;
    }

    public static isValidDTExpr(expr: string): boolean {
        return expr.match(this.validDtRegExp) != undefined;
    }

    public get(expression: string){

        if(!DateTime.isValidDTExpr(expression)){
            u.fatal("Invalid Datetime expression: " + expression, this.getPath());
        }

        let date = new Date();
        let dtComponent = '';

        let formatStr = expression.replace(DateTime.validDtRegExp, "$5");
        if(formatStr == ''){
            dtComponent = expression.replace(DateTime.validDtRegExp, "$2");
        }else{
            dtComponent = expression.replace(DateTime.validDtRegExp, "$3");
            let res = date["format"](formatStr, (dtComponent == DateTimeComponent.UTC));
            return res;
        }

        switch(dtComponent){
            case DateTimeComponent.UnixMillis:
                return Date.now();
            case DateTimeComponent.Local:
                return date.toLocaleString();
            case DateTimeComponent.LocalTime:
                return date.toTimeString().substr(0, 8);
            case DateTimeComponent.LocalDate:
                return date.toDateString();
            case DateTimeComponent.LocalMillisecond:
                return date.getMilliseconds();
            case DateTimeComponent.LocalSecond:
                return date.getSeconds();
            case DateTimeComponent.LocalMinute:
                return date.getMinutes();
            case DateTimeComponent.LocalHour:
                return date.getHours();
            case DateTimeComponent.LocalDayOfMonth:
                return date.getDate();
            case DateTimeComponent.LocalMonth:
                return date.getMonth() + 1;
            case DateTimeComponent.LocalYear:
                return date.getFullYear();
            case DateTimeComponent.LocalDayOfWeek:
                return date.getDay();
            case DateTimeComponent.UTC:
                return date.toUTCString();
            case DateTimeComponent.UTCTime:
                let nowDate = date;
                return new Date(nowDate.getUTCFullYear(),
                                nowDate.getUTCMonth(),
                                nowDate.getUTCDate(),
                                nowDate.getUTCHours(),
                                nowDate.getUTCMinutes(),
                                nowDate.getUTCSeconds(),
                                nowDate.getUTCMilliseconds())
                            .toTimeString().substr(0, 8);
            case DateTimeComponent.UTCDate:
                let nowDate_ = date;
                return new Date(nowDate_.getUTCFullYear(),
                                nowDate_.getUTCMonth(),
                                nowDate_.getUTCDate())
                            .toDateString();
            case DateTimeComponent.UTCMillisecond:
                return date.getUTCMilliseconds();
            case DateTimeComponent.UTCSecond:
                return date.getUTCSeconds();
            case DateTimeComponent.UTCMinute:
                return date.getUTCMinutes();
            case DateTimeComponent.UTCHour:
                return date.getUTCHours();
            case DateTimeComponent.UTCDayOfMonth:
                return date.getUTCDate();
            case DateTimeComponent.UTCMonth:
                return date.getUTCMonth() + 1;
            case DateTimeComponent.UTCYear:
                return date.getUTCFullYear();
            case DateTimeComponent.UTCDayOfWeek:
                return date.getUTCDay();
        }

        return null;
    }
}

