class Trip < ActiveRecord::Base
  has_one :route
  has_many :stop_times
end
