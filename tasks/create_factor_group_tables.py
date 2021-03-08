import psycopg2, io

from config import pluto

def createMetaTable(cursor):
    sql = '''
        DROP TABLE IF EXISTS tds.adjustment_factors_meta;

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
            region_code TEXT,
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
            MIN(hds.axle_factor) AS axle_factor
        FROM highway_data_services.average_weekday_volume AS hds
        JOIN tds.adjustment_factors_meta AS meta
            ON hds.year = meta.year
            AND meta.type = 'axle_adjustment'
        GROUP BY 1, 2, 3, 4
        ORDER BY 1, 2, 3, 4
    '''
    cursor.execute(sql)
    return [[str(c) for c in row] for row in cursor]

def loadAxles(cursor, rows):
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
            hds.region_code,
            hds.factor_group,
            MAX(hds.seasonal_factor) AS seasonal_factor
        FROM highway_data_services.average_weekday_volume AS hds
        JOIN tds.adjustment_factors_meta AS meta
            ON hds.year = meta.year
            AND meta.type = 'seasonal_adjustment'
        GROUP BY 1, 2, 3, 4, 5
        ORDER BY 1, 2, 3, 4, 5
    '''
    cursor.execute(sql)
    return [[str(c) for c in row] for row in cursor]

def loadSeasons(cursor, rows):
    factorData = []
    for row in rows:
        factorData.append("\t".join(row))

    fd = io.StringIO("\n".join(factorData))
    cursor.copy_from(fd,
        "tds.seasonal_adjustment_factors", sep="\t",
        columns=["factor_id", "year", "month", "region_code", "factor_group", "seasonal_factor"]
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
