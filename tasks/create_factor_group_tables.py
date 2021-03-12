import psycopg2, io

from config import pluto

YEARS = ['2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019']

DEFAULT_SEASONAL_FACTORS = {
    "1": {
        "30": 0.923,
        "40": 0.808,
        "60": 0.634
    },
    "2": {
        "30": 0.944,
        "40": 0.822,
        "60": 0.654
    },
    "3": {
        "30": 1.009,
        "40": 0.884,
        "60": 0.696
    },
    "4": {
        "30": 1.062,
        "40": 0.958,
        "60": 0.778
    },
    "5": {
        "30": 1.093,
        "40": 1.071,
        "60": 1.003
    },
    "6": {
        "30": 1.113,
        "40": 1.113,
        "60": 1.17
    },
    "7": {
        "30": 1.101,
        "40": 1.201,
        "60": 1.5
    },
    "8": {
        "30": 1.1,
        "40": 1.19,
        "60": 1.459
    },
    "9": {
        "30": 1.078,
        "40": 1.079,
        "60": 1.086
    },
    "10": {
        "30": 1.078,
        "40": 1.035,
        "60": 0.943
    },
    "11": {
        "30": 1.018,
        "40": 0.942,
        "60": 0.764
    },
    "12": {
        "30": 1.019,
        "40": 0.912,
        "60": 0.718
    }
}

REGIONS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
CLASSES = [
    '1',  '2',  '4',  '6',  '7',  '8',  '9',
    '11', '12', '14', '16', '17', '18', '19'
];

def createMetaTable(cursor):
    sql = '''
        DROP TABLE IF EXISTS tds.adjustment_factors_meta CASCADE;

        CREATE TABLE tds.adjustment_factors_meta(
            id BIGSERIAL PRIMARY KEY,
            name TEXT,
            year SMALLINT,
            type TEXT,
            method TEXT DEFAULT 'standard',
            year_default BOOLEAN
        )
    '''
    cursor.execute(sql)

def createVehicleTable(cursor):
    sql = '''
        DROP TABLE IF EXISTS tds.vehicle_adjustment_factors;

        CREATE TABLE tds.vehicle_adjustment_factors(
            factor_id BIGINT,
            year SMALLINT,
            region_code TEXT,
            functional_class SMALLINT,
            axle_factor DOUBLE PRECISION,
            CONSTRAINT factor_id_fk
                FOREIGN KEY (factor_id)
                REFERENCES tds.adjustment_factors_meta(id)
                ON DELETE CASCADE
        )
    '''
    cursor.execute(sql)

def createSeasonalTable(cursor):
    sql = '''
        DROP TABLE IF EXISTS tds.seasonal_adjustment_factors;

        CREATE TABLE tds.seasonal_adjustment_factors(
            factor_id BIGINT,
            year SMALLINT,
            month SMALLINT,
            factor_group SMALLINT,
            seasonal_factor DOUBLE PRECISION,
            CONSTRAINT factor_id_fk
                FOREIGN KEY (factor_id)
                REFERENCES tds.adjustment_factors_meta(id)
                ON DELETE CASCADE
        )
    '''
    cursor.execute(sql)

def queryYears(cursor):
    sql = '''
        SELECT DISTINCT year
        FROM highway_data_services.average_weekday_volume
        ORDER BY 1;
    '''
    cursor.execute(sql)
    return [str(row[0]) for row in cursor]

def loadYears(cursor, rows):
    data = []
    for year in rows:
        data.append(
            "\t".join([
                "{} Historic Axle Factor".format(year),
                str(year), 'axle_adjustment', 'historical', str(True)
            ])
        )
        data.append(
            "\t".join([
                "{} Historic Seasonal Factor".format(year),
                str(year), 'seasonal_adjustment', 'historical', str(True)
            ])
        )
    fd = io.StringIO("\n".join(data))
    cursor.copy_from(fd,
        "tds.adjustment_factors_meta", sep="\t",
        columns=["name", "year", "type", "method", "year_default"]
    )

def queryAxles(cursor):
    sql = '''
        SELECT meta.id,
            hds.year,
            hds.region_code,
            hds.functional_class,
            AVG(hds.axle_factor) AS axle_factor
        FROM highway_data_services.average_weekday_volume AS hds
        JOIN tds.adjustment_factors_meta AS meta
            ON hds.year = meta.year
            AND meta.type = 'axle_adjustment'
        WHERE axle_factor != 0.0
        AND axle_factor != 1.0
        GROUP BY 1, 2, 3, 4
        ORDER BY 1, 2, 3, 4
    '''
    cursor.execute(sql)
    rows = [[c for c in row] for row in cursor]
    for row in rows:
        row[4] = round(row[4], 3)
    return [[str(c) for c in row] for row in rows]

def loadAxles(cursor, rows):
    idDict = {}
    dataDict = {}
    for row in rows:
        id, year, rc, fc, f = row
        idDict[year] = id
        if year not in dataDict:
            dataDict[year] = {}
        if rc not in dataDict[year]:
            dataDict[year][rc] = {}

        dataDict[year][rc][fc] = f

    for year in YEARS:
        data = dataDict[year]
        for rc in REGIONS:
            if rc not in data:
                data[rc] = {}

            for fc in CLASSES:
                if fc not in data[rc]:
                    rows.append([idDict[year], year, rc, fc, "1"])

    factorData = []
    for row in rows:
        factorData.append("\t".join(row))

    fd = io.StringIO("\n".join(factorData))
    cursor.copy_from(fd,
        "tds.vehicle_adjustment_factors", sep="\t",
        columns=["factor_id", "year", "region_code", "functional_class", "axle_factor"]
    )

def querySeasons(cursor):
    sql = '''
        SELECT meta.id,
            hds.year,
            hds.month,
            hds.factor_group,
            AVG(hds.seasonal_factor) AS seasonal_factor
        FROM highway_data_services.average_weekday_volume AS hds
        JOIN tds.adjustment_factors_meta AS meta
            ON hds.year = meta.year
            AND meta.type = 'seasonal_adjustment'
        WHERE seasonal_factor != 0.0
        GROUP BY 1, 2, 3, 4
        ORDER BY 1, 2, 3, 4
    '''
    cursor.execute(sql)
    rows = [[c for c in row] for row in cursor]
    for row in rows:
        row[4] = round(row[4], 3)
    return [[str(c) for c in row] for row in rows]

def loadSeasons(cursor, rows):
    idDict = {}
    dataDict = {}
    for row in rows:
        id, year, month, fg, f = row
        idDict[year] = id
        if year not in dataDict:
            dataDict[year] = {}
        if month not in dataDict[year]:
            dataDict[year][month] = {}

        dataDict[year][month][fg] = f

    for year in YEARS:
        data = dataDict[year]
        for month, fgs in DEFAULT_SEASONAL_FACTORS.items():
            if month not in data:
                data[month] = {}

            for fg, f in fgs.items():
                if fg not in data[month]:
                    rows.append([idDict[year], year, month, fg, str(f)])

    factorData = []
    for row in rows:
        factorData.append("\t".join(row))

    fd = io.StringIO("\n".join(factorData))
    cursor.copy_from(fd,
        "tds.seasonal_adjustment_factors", sep="\t",
        columns=["factor_id", "year", "month", "factor_group", "seasonal_factor"]
    )

def main():
    conn = psycopg2.connect(pluto)
    cursor = conn.cursor()

    createMetaTable(cursor)
    distinctYears = queryYears(cursor)
    loadYears(cursor, distinctYears)

    createVehicleTable(cursor)
    axleAdjustments = queryAxles(cursor)
    loadAxles(cursor, axleAdjustments)

    createSeasonalTable(cursor)
    seasonalAdjustments = querySeasons(cursor)
    loadSeasons(cursor, seasonalAdjustments)

    cursor.close()
    conn.commit()
    conn.close()

if __name__ == "__main__":
    main()
