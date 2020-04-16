// This is an independent project of an individual developer. Dear PVS-Studio, please check it.
// PVS-Studio Static Code Analyzer for C, C++ and C#: http://www.viva64.com
#include "GLib.h"

long long CGLib::first_time = 0;

CGLib::CGLib() {
}

CGLib::~CGLib() {
}

long long CGLib::time() {
	long long t = abstime();
	if (!first_time) first_time = t;
	return t - first_time;
}

void CGLib::start_time() {
	long long t = abstime();
	first_time = t;
}

long long CGLib::abstime() {
  chrono::milliseconds ms = chrono::duration_cast<chrono::milliseconds>(
    chrono::system_clock::now().time_since_epoch());
	return ms.count();
}

void CGLib::GetVint(const string & st, vector<int>& res) {
	string st2;
	int sign = 1;
	for (int i = 0; i < st.size(); ++i) {
		if (isdigit(st[i])) {
			// Check minor
			if (st2.empty() && i > 0 && (st[i - 1] == 'm' || st[i-1] == 'b')) sign = -1;
			st2 += st[i];
		}
		else if (!st2.empty()) {
			res.push_back(atoi(st2));
			st2 = "";
		}
	}
	if (!st2.empty()) {
		res.push_back(sign * atoi(st2));
	}
}

void CGLib::WriteLog(int i, string st) {
  cout << i << ": " << st << endl;
}

// Take chromatic note, key and minor flag and convert to real note, octave and alteration
void CGLib::GetRealNote(int no, int key, int mi, int &no2, int &oct, int &alter) {
	oct = no / 12;
	if (mi) {
		// Get base chromatic note for current note
		no2 = note_base_m[key][no % 12];
		// If it is diatonic, just return it
		if (no2 > -1) {
			if (no2 > no % 12 + 6) --oct;
			if (no2 < no % 12 - 6) ++oct;
			alter = no % 12 - no2;
		}
		// If not, build needed note from next lower note
		else {
			no2 = note_base_m[key][(no + 11) % 12];
			if (no2 > no % 12 + 6) --oct;
			if (no2 < no % 12 - 6) ++oct;
			alter = no % 12 - no2;
		}
	}
	else {
		no2 = note_base[key][no % 12];
		if (no2 > -1) {
			if (no2 > no % 12 + 6) --oct;
			if (no2 < no % 12 - 6) ++oct;
			alter = no % 12 - no2;
		}
		else {
			no2 = note_base[key][(no + 11) % 12];
			if (no2 > no % 12 + 6) --oct;
			if (no2 < no % 12 - 6) ++oct;
			alter = no % 12 - no2;
		}
	}
	if (alter > 2) alter -= 12;
	if (alter < -2) alter += 12;
}

string CGLib::GetAlterName(int alter) {
	if (alter == -1) return "b";
	else if (alter == -2) return "bb";
	else if (alter == 1) return "#";
	else if (alter == 2) return "##";
	return "";
}

string CGLib::GetRealNoteName(int no, int key, int mi) {
	int no2, oct, alter;
	GetRealNote(no, key, mi, no2, oct, alter);
	return NoteName[no2] + GetAlterName(alter);
}

// A Dequeue(Double ended queue) based method for finding maximum element of
// all subarrays of size k
void CGLib::GetMovingMax(vector<int> &arr, int k, vector<int> &lmax) {
	if (arr.size() == 1) {
		lmax[0] = arr[0];
		return;
	}
	// Create a Double Ended Queue, Qi that will store indexes of array elements
	// The queue will store indexes of useful elements in every window and it will
	// maintain decreasing order of values from front to rear in Qi, i.e., 
	// arr[Qi.front[]] to arr[Qi.rear()] are sorted in decreasing order
	int n = arr.size();
	int k2 = min(k, n);
	deque<int> Qi(k2);

	/* Process first k (or first window) elements of array */
	int i;
	for (i = 0; i < k2; ++i) {
		// For very element, the previous smaller elements are useless so
		// remove them from Qi (remove from rear)
		while ((!Qi.empty()) && arr[i] >= arr[Qi.back()])
			Qi.pop_back();
		// Add new element at rear of queue
		Qi.push_back(i);
	}
	// Process rest of the elements, i.e., from arr[k2] to arr[n-1]
	for (; i < n; ++i) {
		// The element at the front of the queue is the largest element of
		// previous window, so print it
		lmax[i - k2 / 2] = arr[Qi.front()];
		// Remove the elements which are out of this window (remove from front of queue)
		while ((!Qi.empty()) && Qi.front() <= i - k2)
			Qi.pop_front();
		// Remove all elements smaller than the currently
		// being added element (remove useless elements)
		while ((!Qi.empty()) && arr[i] >= arr[Qi.back()])
			Qi.pop_back();
		// Add current element at the rear of Qi
		Qi.push_back(i);
	}
	// Print the maximum element of last window
	lmax[i - k2 / 2] = arr[Qi.front()];
	// Fill borders
	for (i = 0; i <= k2 / 2; ++i) {
		lmax[i] = lmax[k2 - k2 / 2];
		lmax[n - i - 1] = lmax[n - k2 / 2];
	}
}

int CGLib::NumDigits(int number) {
	int digits = 0;
	if (number < 0) digits = 1; // remove this line if '-' counts as a digit
	while (number) {
		number /= 10;
		digits++;
	}
	return digits;
}
