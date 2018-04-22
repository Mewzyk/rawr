import csv



def expectedValue():
	output = []
	with open('EPC_2000_2010_new.csv') as csvfile:
		reader = csv.reader(csvfile, delimiter=',')
		for row in reader:
			if(row[0] == 'Year'):
				output = [0 for i in row]
			else:
				
				for i in range(1, len(row)):
					output[i] += float(row[i])
					
		output = [i / 11 for i in output]
		print(output)
