class StopTimesController < ApplicationController
  
  def upcoming_buses
    
    #@stoptimes = StopTime.select(:departure_time).where(:stop_id => params[:stop_id]) \
     #            .where("departure_time between curtime() and addtime(curtime(), '00:10:00')").all
     
    current_time = (Time.now).strftime("%H:%M:%S")
    future_time = (Time.now + 1800).strftime("%H:%M:%S") #current time plus 30 minutes
    day_type = ""
    
    if (Time.now.wday < 6)
      day_type = "Weekday"
    elsif (Time.now.wday == 6)
	day_type = "Saturday"
    elsif (Time.now.wday == 7)
      day_type = "Sunday"  
    end
    
    
    if ((Time.now + 1800).wday == Time.now.wday) then
      
      
      @stoptimes = StopTime.find_by_sql ["select st.departure_time, tr.trip_headsign, rt.route_short_name
                               from stop_times as st inner join trips as tr
                               on st.trip_id = tr.trip_id
                               inner join routes as rt
                               on tr.route_id = rt.route_id
                               where st.stop_id = ?
                               and (st.departure_time between ? and ?)
                               and (tr.service_id like '%#{day_type}%')
                               order by st.departure_time asc
                               limit 50",
                               params[:stop_id], current_time, future_time]
    else
      
          
    @stoptimes = StopTime.find_by_sql ["select st.departure_time, tr.trip_headsign, rt.route_short_name
                               from stop_times as st inner join trips as tr
                               on st.trip_id = tr.trip_id
                               inner join routes as rt
                               on tr.route_id = rt.route_id
                               where st.stop_id = ?
                               and ((st.departure_time between ? and ?)
                               or (st.departure_time between '00:00:01' and ?))
                               and (tr.service_id like '%#{day_type}%')
                               order by st.departure_time asc
                               limit 50",
                               params[:stop_id], current_time, "11:59:59", future_time]
    end
    
           
    
    @mytimes = Array.new
    
    @stoptimes.each do |row|
           
      @mytimes.push(:route_short_name => row.route_short_name, \
                    :departure_time =>  row.departure_time_before_type_cast, \
                    :trip_headsign => row.trip_headsign)
      
    end
    
    render :text => @mytimes.to_json
    
  end
    
end
