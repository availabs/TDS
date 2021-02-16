import argparse

parser = argparse.ArgumentParser(description="Makes fake files for uploader.")
parser.add_argument("-n", "--num", default=5, type=int, dest="num_files", help="The number of text files to generate.")
parser.add_argument("-c", "--cols", default=40, type=int, dest="num_cols", help="The number of columns per row to generate. Defaults to 40.")
parser.add_argument("-r", "--rows", default=5000, type=int, dest="num_rows", help="The number of rows of data to generate. Defaults to 5000.")

def main():
    args = vars(parser.parse_args())

    for n in range(args["num_files"]):
        rows = []

        for r in range(args["num_rows"]):
            row = []
            for c in range(args["num_cols"]):
                row.append("value-{}-{}-{}".format(n, r, c))
            # end for
            rows.append("\t".join(row))
        # end for

        with open("fake_file_{}.txt".format(n), "w") as outfile:
            outfile.write("\n".join(rows))
        # end with
    # end for

if __name__ == "__main__":
    main()
