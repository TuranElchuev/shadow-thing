import { u, EntityOwner } from "../index"

enum DateTimeComponent {
    UnixMillis = "unix",
    Local = "local",
    LocalTime = "l_time",
    LocalDate = "l_date",
    LocalMillisecond = "l_ms",
    LocalSecond = "l_s",
    LocalMinute = "l_m",
    LocalHour = "l_h",
    LocalDayOfMonth = "l_d",
    LocalMonth = "l_M",
    LocalYear = "l_y",
    LocalDayOfWeek = "l_dow",
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
    UTCDayOfWeek = "u_dow"
}

export class DateTime {

    public static readonly pathToken = "dt";

    private parent: EntityOwner = undefined;

    public constructor(parent: EntityOwner){
        this.parent = parent;
    }

    public get(component: string){

        switch(component){
            case DateTimeComponent.UnixMillis:
                return Date.now();
            case DateTimeComponent.Local:
                return new Date().toLocaleString();
            case DateTimeComponent.LocalTime:
                return new Date().toTimeString().substr(0, 8);
            case DateTimeComponent.LocalDate:
                return new Date().toDateString();
            case DateTimeComponent.LocalMillisecond:
                return new Date().getMilliseconds();
            case DateTimeComponent.LocalSecond:
                return new Date().getSeconds();
            case DateTimeComponent.LocalMinute:
                return new Date().getMinutes();
            case DateTimeComponent.LocalHour:
                return new Date().getHours();
            case DateTimeComponent.LocalDayOfMonth:
                return new Date().getDate();
            case DateTimeComponent.LocalMonth:
                return new Date().getMonth();
            case DateTimeComponent.LocalYear:
                return new Date().getFullYear();
            case DateTimeComponent.LocalDayOfWeek:
                return new Date().getDay();
            case DateTimeComponent.UTC:
                return new Date().toUTCString();
            case DateTimeComponent.UTCTime:
                let nowDate = new Date();
                return new Date(nowDate.getUTCFullYear(),
                                nowDate.getUTCMonth(),
                                nowDate.getUTCDate(),
                                nowDate.getUTCHours(),
                                nowDate.getUTCMinutes(),
                                nowDate.getUTCSeconds(),
                                nowDate.getUTCMilliseconds())
                            .toTimeString().substr(0, 8);
            case DateTimeComponent.UTCDate:
                let nowDate_ = new Date();
                return new Date(nowDate_.getUTCFullYear(),
                                nowDate_.getUTCMonth(),
                                nowDate_.getUTCDate())
                            .toDateString();
            case DateTimeComponent.UTCMillisecond:
                return new Date().getUTCMilliseconds();
            case DateTimeComponent.UTCSecond:
                return new Date().getUTCSeconds();
            case DateTimeComponent.UTCMinute:
                return new Date().getUTCMinutes();
            case DateTimeComponent.UTCHour:
                return new Date().getUTCHours();
            case DateTimeComponent.UTCDayOfMonth:
                return new Date().getUTCDate();
            case DateTimeComponent.UTCMonth:
                return new Date().getUTCMonth();
            case DateTimeComponent.UTCYear:
                return new Date().getUTCFullYear();
            case DateTimeComponent.UTCDayOfWeek:
                return new Date().getUTCDay();
            default:
                u.fatal(`Unknown Datetime component: ${component}`, this.parent.getGlobalPath());
        }

        return null;
    }
}