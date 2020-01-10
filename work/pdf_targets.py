#!/usr/bin/env python
import sys
"""
from PyPDF2 import PdfFileReader
def pdf_list_anchors(fh):
    reader = PdfFileReader(fh)
    destinations = reader.getNamedDestinations()
    for name in destinations:
        print(name)
pdf_list_anchors(open(sys.argv[1]))
"""

def print_pages(lst):
    for dest in lst:
        if isinstance(dest, list):
            print_pages(dest)
            continue
        print(dest["/Title"], reader.getDestinationPageNumber(dest))
    

from PyPDF2 import PdfFileReader
from PyPDF2.pdf import Destination
# Read the pdf file
reader = PdfFileReader(sys.argv[1])
print_pages(reader.outlines)
