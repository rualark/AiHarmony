#pragma once

// Convert chromatic to diatonic
#define C_D(note, tonic, minor) (minor?m_C_D(note, tonic):maj_C_D(note, tonic))
#define maj_C_D(note, tonic) (chrom_to_dia[(note + 12 - tonic) % 12] + ((note + 12 - tonic) / 12) * 7)
#define m_C_D(note, tonic) (m_chrom_to_dia[(note + 12 - tonic) % 12] + ((note + 12 - tonic) / 12) * 7)

// Convert diatonic to chromatic
#define D_C(note, tonic, minor) (minor?m_D_C(note, tonic):maj_D_C(note, tonic))
#define maj_D_C(note, tonic) (dia_to_chrom[note % 7] + (note / 7 - 1) * 12 + tonic)
#define m_D_C(note, tonic) (m_dia_to_chrom[note % 7] + (note / 7 - 1) * 12 + tonic)

const int dia_to_chrom[] = { 0, 2, 4, 5, 7, 9, 11 };
const int chrom_to_dia[] = { 0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6 };
const int m_dia_to_chrom[] = { 0, 2, 3, 5, 7, 8, 10 };
//                             A     B  C     D     E  F     G
const int m_chrom_to_dia[] = { 0, 0, 1, 2, 2, 3, 3, 4, 5, 5, 6, 6 };

