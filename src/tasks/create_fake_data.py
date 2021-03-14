import random, datetime, math

VOLUME_HEADERS = [
  "RC_STATION","COUNT_ID","RG","REGION_CODE","COUNTY_CODE",
  "STAT","RCSTA","FUNCTIONAL_CLASS","FACTOR_GROUP",
  "LATITUDE","LONGITUDE","SPECIFIC_RECORDER_PLACEMENT",
  "CHANNEL_NOTES","DATA_TYPE","VEHICLE_AXLE_CODE",
  "YEAR","MONTH","DAY","DAY_OF_WEEK","FEDERAL_DIRECTION",
  "LANE_CODE","LANES_IN_DIRECTION","COLLECTION_INTERVAL",
  "INTERVAL_1_1","INTERVAL_1_2","INTERVAL_1_3","INTERVAL_1_4",
  "INTERVAL_2_1","INTERVAL_2_2","INTERVAL_2_3","INTERVAL_2_4",
  "INTERVAL_3_1","INTERVAL_3_2","INTERVAL_3_3","INTERVAL_3_4",
  "INTERVAL_4_1","INTERVAL_4_2","INTERVAL_4_3","INTERVAL_4_4",
  "INTERVAL_5_1","INTERVAL_5_2","INTERVAL_5_3","INTERVAL_5_4",
  "INTERVAL_6_1","INTERVAL_6_2","INTERVAL_6_3","INTERVAL_6_4",
  "INTERVAL_7_1","INTERVAL_7_2","INTERVAL_7_3","INTERVAL_7_4",
  "INTERVAL_8_1","INTERVAL_8_2","INTERVAL_8_3","INTERVAL_8_4",
  "INTERVAL_9_1","INTERVAL_9_2","INTERVAL_9_3","INTERVAL_9_4",
  "INTERVAL_10_1","INTERVAL_10_2","INTERVAL_10_3","INTERVAL_10_4",
  "INTERVAL_11_1","INTERVAL_11_2","INTERVAL_11_3","INTERVAL_11_4",
  "INTERVAL_12_1","INTERVAL_12_2","INTERVAL_12_3","INTERVAL_12_4",
  "INTERVAL_13_1","INTERVAL_13_2","INTERVAL_13_3","INTERVAL_13_4",
  "INTERVAL_14_1","INTERVAL_14_2","INTERVAL_14_3","INTERVAL_14_4",
  "INTERVAL_15_1","INTERVAL_15_2","INTERVAL_15_3","INTERVAL_15_4",
  "INTERVAL_16_1","INTERVAL_16_2","INTERVAL_16_3","INTERVAL_16_4",
  "INTERVAL_17_1","INTERVAL_17_2","INTERVAL_17_3","INTERVAL_17_4",
  "INTERVAL_18_1","INTERVAL_18_2","INTERVAL_18_3","INTERVAL_18_4",
  "INTERVAL_19_1","INTERVAL_19_2","INTERVAL_19_3","INTERVAL_19_4",
  "INTERVAL_20_1","INTERVAL_20_2","INTERVAL_20_3","INTERVAL_20_4",
  "INTERVAL_21_1","INTERVAL_21_2","INTERVAL_21_3","INTERVAL_21_4",
  "INTERVAL_22_1","INTERVAL_22_2","INTERVAL_22_3","INTERVAL_22_4",
  "INTERVAL_23_1","INTERVAL_23_2","INTERVAL_23_3","INTERVAL_23_4",
  "INTERVAL_24_1","INTERVAL_24_2","INTERVAL_24_3","INTERVAL_24_4",
  "TOTAL","FLAG_FIELD","BATCH_ID"
]

REGIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
REGION_CODES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 0]
COUNTY_CODES = [1, 2, 3, 4, 5, 6, 7, 8]
CLASSES = [1,  2,  4,  6,  7,  8,  9, 11, 12, 14, 16, 17, 18, 19]
FACTOR_GROUPS = [30, 40, 60]
DIRECTIONS = [[1, 5], [3, 7]]

WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

HOURLY_RATES = [17, 8]

def main():

    random.seed()

    rIndex = random.randrange(len(REGIONS))
    rg = REGIONS[rIndex]
    region_code = REGION_CODES[rIndex]

    county_code = random.choice(COUNTY_CODES)
    functional_class = random.choice(CLASSES)
    factor_group = random.choice(FACTOR_GROUPS)

    dirs = random.choice(DIRECTIONS)

    stat = "FAKE"
    rc_station = str(region_code) + str(county_code) + "_" + stat

    year = random.randrange(2010, 2020)
    month = random.randrange(1, 13)
    day = random.randrange(1, 18)

    numdays = random.randrange(3, 12)

    start = datetime.date(year, month, day)

    delta= datetime.timedelta(days=1)

    while start.weekday() > 4:
        start += delta
    month = start.month
    day = start.day

    count_id = str(start).replace("-", "") + "_" + str(region_code) + str(county_code) + stat

    vac = random.randrange(2) + 1

    batch_id = random.randrange(10000, 100000)

    data = [",".join(VOLUME_HEADERS)]

    basemean = random.randrange(10, 50)
    basedev = basemean * 0.25

    done = False
    daysCompleted = 0
    while not done:
        dow = WEEKDAYS[start.weekday()]

        basecount = [
            rc_station, count_id, rg, region_code, county_code,
            stat, str(region_code) + str(county_code) + stat,
            functional_class, factor_group, "", "",
            "fake placement", "fake notes", "Volume Data", vac,
            year, start.month, start.day, dow
        ]

        for d in range(len(dirs)):
            dir = dirs[d]

            mean = basemean
            rates = [HOURLY_RATES[d], 25 - HOURLY_RATES[d]]

            count = [c for c in basecount]
            count.extend([dir, 0, 1, 15])

            total = 0
            for i in range(24):
                hourly = random.gauss(mean, basedev)

                if random.random() <= 0.05:
                    crapper = random.random() * 4.0 + 2.0
                    if random.random() <= 0.5:
                        crapper = 1.0 / crapper
                    hourly *= crapper

                for ii in range(4):
                    interval = int(round(random.gauss(hourly * 0.25, basedev * 0.25)))

                    count.append(max(0, interval))
                    total += interval

                    if i <= rates[0]:
                        mean *= (1.0 + 0.25 / rates[0])
                    else:
                        mean /= (1.0 + 0.25 / rates[1])
                # end
            # end

            count.extend([total, "", batch_id])
            data.append(",".join([str(d) for d in count]))
        # end

        daysCompleted += 1
        if daysCompleted >= numdays and start.weekday() < 5:
            done = True

        start += delta;

    file = count_id + ".csv"

    with open(file, "w") as out:
        out.write("\n".join(data))

if __name__ == "__main__":
    main()
