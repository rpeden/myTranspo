class Stop < ActiveRecord::Base
  has_and_belongs_to_many :stop_times
end
