import React, { useState } from 'react';
import moment from 'moment';
import '../css/DateTimeFIlter.css'; // Import the updated CSS file for better styling
const DateTimeFilter = ({setfromdatetime,settodatetime}) => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [alert,setalert]=useState('');
  const handleFromDateChange = (e) => {
    const value = e.target.value;
    setalert("");
    if (moment(value).isBefore(moment().add(1, 'hour'))) {
      setalert('Please select a From Date and Time that is at least one hour from now.');
      setFromDate('');
    } else {
      if (toDate && moment(value).add(1, 'hour').isAfter(moment(toDate))) {
        setToDate('');
        settodatetime('');
        setalert('The selected To Date and Time must be at least one hour after the From Date and Time.');
      }
      setFromDate(value);
      setfromdatetime(value);
    }
  };
  
  const handleToDateChange = (e) => {
    setalert("");
    const value = e.target.value;
    if (fromDate && moment(value).isBefore(moment(fromDate).add(1, 'hour'))) {
      setalert('Please select a To Date and Time that is at least one hour after the From Date and Time.');
      setToDate('');
      settodatetime('');
    } else {
      setToDate(value);
      settodatetime(value);
    }
  };

  const getMinFromDate = () => {
    // Minimum fromDate should be at least 1 hour from now
    return moment().add(1, 'hour').format('YYYY-MM-DDTHH:mm');
  };

  const getMinToDate = () => {
    // Minimum toDate should be at least 1 hour after fromDate
    return fromDate ? moment(fromDate).add(1, 'hour').format('YYYY-MM-DDTHH:mm') : getMinFromDate();
  };

  return (
    <div className="date-time-filter" data-testid="datetime-filter">
      <div className="datetime-picker">
        <label htmlFor="fromDate">FROM DATE:</label>
        <input
          type="datetime-local"
          id="fromDate"
          value={fromDate}
          onChange={handleFromDateChange}
          min={getMinFromDate()}
        />
      </div>
      <div className="datetime-picker">
        <label htmlFor="toDate">TO DATE:</label>
        <input
          type="datetime-local"
          id="toDate"
          value={toDate}
          onChange={handleToDateChange}
          min={getMinToDate()}
          disabled={!fromDate} // Disable toDate until fromDate is set
        />
      </div>
      {/* <div>{alert}</div> */}
    </div>
  );
};

export default DateTimeFilter;
