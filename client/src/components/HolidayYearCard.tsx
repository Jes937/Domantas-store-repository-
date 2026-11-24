//current holiday year, with progress shown in sidebar
function getHolidayYear(today: Date) {
    //Months start from 0. So september = 8
    const startYear = today.getMonth() >= 8 ? today.getFullYear() : today.getFullYear() -1;
    
    //First and last day on the Holiday year
    const start = new Date(startYear, 8, 1);       //1.sep
    const end = new Date(startYear + 1, 7, 31);    //31.Aug(new year)
    
    //How far into the new year are we, in percent
    const dayMs = 24 * 60 * 60 * 1000;
    const totalDays = Math.round((end.getTime()-start.getTime()) /dayMs) + 1;
    const daysGone = Math.floor((today.getTime()-start.getTime()) / dayMs) + 1;
    const percent = Math.min(100, Math.round(((daysGone / totalDays)* 100)));
    
    //Whole months that are finished since 1sep
    const monthsEarned = (today.getFullYear() - startYear) * 12 + today.getMonth() - 8;
    
    return {
        label: `${startYear}/${String(startYear + 1).slice(2)}`,
        percent,
        monthsEarned,
    };
}

export function HolidayYearCard() {
    const year = getHolidayYear(new Date());

    return (
        <div className="year-card">
            <div className="year-card-top">
                <span className="year-card-title">Holiday year {year.label}</span>
                <span className="year-card-percent">{year.percent}%</span>
            </div>
            <div className="year-card-bar" role="progressbar" aria-valuenow={year.percent} aria-valuemin={0} aria-valuemax={100}>
                <div style={{ width: `${year.percent}%` }} />
            </div>
            <span className="year-card-sub">{year.monthsEarned} of 12 months earned · ends 31 Aug</span>
        </div>
    );
}