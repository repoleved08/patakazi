-- Company profile enhancements: services and working hours
alter table companies add column if not exists services text not null default '';
alter table companies add column if not exists working_hours text not null default '';
