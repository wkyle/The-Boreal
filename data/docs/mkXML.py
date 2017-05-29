#! /usr/bin/python3

import xml.etree.ElementTree as et
import numpy as np
import csv
from scipy.stats import entropy as S
import re




filepath1 = "/home/wes/Personal/theBoreal/docs/FEDResultsMacro-2015.csv"
filepath2 = "/home/wes/Personal/theBoreal/docs/FEDResultsMicro-2015.csv"


def getFEDmacro(file_path):
    FEDmacro = []
    with open(file_path, 'r') as f:
        header = f.readline()
        lines = f.readlines()
        for line in lines:
            #some columns are populations and need to be integers
            #others are percentages and should be floats

            dataline = [float(i) for i in line.strip("\n").split(",")]
            dataline[0] = int(dataline[0]) #district number
            dataline[1] = int(dataline[1]) #population
            dataline[2] = int(dataline[2]) #electors
            dataline[3] = int(dataline[3]) #polling stations
            dataline[4] = int(dataline[4]) #valid ballots
            dataline[6] = int(dataline[6]) #rejected ballots
            dataline[8] = int(dataline[8]) #total ballots cast
            FEDmacro.append(dataline)
    return FEDmacro


def getFEDmicro(file_path):
    #using csv library here because of commas within some entries
    #csv library handles them naturally
    FEDmicro = list(csv.reader(open(file_path), ))[1:] #skip the header line
    FEDmicro = [[j.strip() for j in i] for i in FEDmicro]
    for dataline in FEDmicro:
        dataline[2] = int(dataline[2]) #district number
        dataline[6] = int(dataline[6]) #votes obtained
        dataline[7] = float(dataline[7]) #percentage of votes obtained
    return FEDmicro


def getEntropy(FEDid, FED_micro_data):
    records = []
    for dataline in FED_micro_data:
        if dataline[2] == FEDid:
            records.append(dataline[7]/100.0)
    entropy = S(records)
    return entropy


def getCandidateInfo(FEDid, FED_micro_data):
    records = []
    for dataline in FED_micro_data:
        if dataline[2] == FEDid:
            records.append([dataline[3], #candidate name
                            dataline[4], #candidate affiliation
                            dataline[5], #candidate occupation
                            dataline[7]]) #candidate percent
            if dataline[8] != '':
                records[-1].append("Yes")
            else:
                records[-1].append("No")
    return records


def getFEDname(FEDid, FED_micro_data):
    for dataline in FED_micro_data:
        if dataline[2] == FEDid:
            return dataline[1]


def getFEDprovince(FEDid, FED_micro_data):
    for dataline in FED_micro_data:
        if dataline[2] == FEDid:
            return dataline[0]


def  getSeatAssignment(FEDid, FED_micro_data):
    for dataline in FED_micro_data:
        if dataline[2] == FEDid and dataline[10] != '':
            return dataline[10]
    return ""


def genPhotoName(fullname):
    name = fullname.split()
    name = name[1:] + name[0:1]
    name = [word.replace("-", "").replace("'", "") for word in name]
    name = "".join(name)
    return name


def mkTree(FED_macro_data, FED_micro_data):
    root = et.Element("FEDs", attrib={"year" : "2015"})
    for dataline in FED_macro_data:
        FED = et.SubElement(root, "FED")
        FED.set("id", str(dataline[0]))

        name = et.SubElement(FED, "Name")
        name.text = getFEDname(dataline[0], FED_micro_data)

        seat_assignment = et.SubElement(FED, "SeatAssignment")
        seat_assignment.text = getSeatAssignment(dataline[0], FED_micro_data)

        province = et.SubElement(FED, "Province")
        province.text = getFEDprovince(dataline[0], FED_micro_data)

        population = et.SubElement(FED, "Population")
        population.text = str(dataline[1])

        polling_stations = et.SubElement(FED, "PollingStations")
        polling_stations.text = str(dataline[3])

        electors = et.SubElement(FED, "Electors")
        electors.text = str(dataline[2])

        turnout = et.SubElement(FED, "Turnout")
        turnout.text = str(dataline[9])

        rejected_ballots = et.SubElement(FED, "RejectedBallots")
        rejected_ballots.text = str(dataline[7])

        entropy = et.SubElement(FED, "Competitiveness")
        entropy.text = str(getEntropy(dataline[0], FED_micro_data))

        candidates = et.SubElement(FED, "Candidates")
        candidate_list = getCandidateInfo(dataline[0], FED_micro_data)
        for candidate in candidate_list:
            race_candidate = et.SubElement(candidates, "Candidate")
            candidate_name = et.SubElement(race_candidate, "CandidateName")
            candidate_name.text = str(candidate[0])
            candidate_affiliation = et.SubElement(race_candidate, "CandidateAffiliation")
            candidate_affiliation.text = str(candidate[1]) 
            candidate_occupations = et.SubElement(race_candidate, "CandidateOccupations")
            for job in candidate[2].split(","):
                et.SubElement(candidate_occupations, "Occupation").text = str(job).strip()
            
            candidate_win = et.SubElement(race_candidate, "Victor")
            candidate_win.text = candidate[4]
            if candidate[4] == "Yes":
                mp_photo = et.SubElement(race_candidate, "OfficialMPPhoto")
                fullname = "http://www.parl.gc.ca/Parliamentarians/Images/OfficialMPPhotos/42/"+\
                           genPhotoName(candidate[0])
                if "Liberal" in candidate[1] or "Independent" in candidate[1]:
                    mp_photo.text = fullname + "_Lib.jpg"
                elif "NDP" in candidate[1]:
                    mp_photo.text = fullname + "_NDP.jpg"
                elif "Conserv" in candidate[1]:
                    mp_photo.text = fullname + "_CPC.jpg"
                elif "Green" in candidate[1]:
                    mp_photo.text = fullname + "_GP.jpg"
                elif "Bloc" in candidate[1]:
                    mp_photo.text = fullname + "_BQ.jpg"
                else:
                    mp_photo.text = ""
            candidate_percent_won = et.SubElement(race_candidate, "PercentOfVote")
            candidate_percent_won.text = str(candidate[3])
    return root


def writeTree(root, file_name):
    try:
        tree = et.ElementTree(root)
        tree.write(file_name)
    except Exception as e:
        print("Failure in writeTree(): ", e)





FEDmacro = getFEDmacro(filepath1)
FEDmicro = getFEDmicro(filepath2)


root = mkTree(FEDmacro, FEDmicro)
writeTree(root, "FED2015.xml")
