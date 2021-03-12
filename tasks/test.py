import psycopg2, io

from config import pluto

def main():
    conn = psycopg2.connect(pluto)
    cursor = conn.cursor()

    # sql = '''
    #     SELECT hds.year,
    #         hds.month,
    #         hds.factor_group,
    #         ARRAY_AGG(DISTINCT hds.seasonal_factor) AS seasonal_factor
    #     FROM highway_data_services.average_weekday_volume AS hds
    #     GROUP BY 1, 2, 3
    #     ORDER BY 1, 2, 3
    # '''
    # sql = '''
    #     SELECT *
    #     FROM tds.seasonal_adjustment_factors
    #     ORDER BY year, month, factor_group
    # '''
    sql = '''
        SELECT hds.year,
            hds.region_code,
            hds.functional_class,
            ARRAY_AGG(DISTINCT hds.axle_factor) AS axle_factor
        FROM highway_data_services.average_weekday_volume AS hds
        GROUP BY 1, 2, 3
        ORDER BY 1, 2, 3
    '''
    cursor.execute(sql)

    for row in cursor:
        print(row)

    cursor.close()
    conn.close()

if __name__ == "__main__":
    main()
