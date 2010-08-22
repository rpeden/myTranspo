class StopTime < ActiveRecord::Base
  has_one :stop
  has_one :trip
end
