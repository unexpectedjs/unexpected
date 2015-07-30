Asserts a string contains one or more substrings.

```javascript
expect('Hello beautiful world!', 'to contain', 'beautiful');
expect('Hello beautiful world!', 'to contain', 'Hello', 'world');
```

In case of a failing expectation you get the following output:

```javascript
expect('Hello world!', 'to contain', 'beautiful');
```

```output
expected 'Hello world!' to contain 'beautiful'

Hello world!
```

The longest matched prefix(es) will be highlighted:

```javascript
expect('BEGIN:VEVENT\n' +
       'UID:B4D3A0F8-6E38-5F0E-8CE7-BA0171DEAA8D\n' +
       'RECURRENCE-ID;TZID=Europe/Copenhagen:20150113T120000\n' +
       'DTSTART;TZID=Europe/Copenhagen:20150203T110000\n' +
       'DTEND;TZID=Europe/Copenhagen:20150203T120000\n' +
       'DTSTAMP:20150114T121235Z\n' +
       'SUMMARY:Lunch\n' +
       'LOCATION:Kalvebod Brygge 24, Copenhagen\n' +
       'END:VEVENT',
       'to contain',
       'UID:6FA459EA-EE8A-3CA4-894E-DB77E160355E');
```

```output
expected 'BEGIN:VEVENT\nUID:B4D3A0F8-6E38-5F0E-8CE7-BA0171DEAA8D\nRECURRENCE-ID;TZID=Europe/Copenhagen:20150113T120000\nDTSTART;TZID=Europe/Copenhagen:20150203T110000\nDTEND;TZID=Europe/Copenhagen:20150203T120000\nDTSTAMP:20150114T121235Z\nSUMMARY:Lunch\nLOCATION:Kalvebod Brygge 24, Copenhagen\nEND:VEVENT'
to contain 'UID:6FA459EA-EE8A-3CA4-894E-DB77E160355E'

BEGIN:VEVENT
UID:B4D3A0F8-6E38-5F0E-8CE7-BA0171DEAA8D
^^^^
RECURRENCE-ID;TZID=Europe/Copenhagen:20150113T120000
DTSTART;TZID=Europe/Copenhagen:20150203T110000
DTEND;TZID=Europe/Copenhagen:20150203T120000
DTSTAMP:20150114T121235Z
SUMMARY:Lunch
LOCATION:Kalvebod Brygge 24, Copenhagen
END:VEVENT
```

This assertion can be negated using the `not` flag:

```javascript
expect('Hello world!', 'not to contain', 'beautiful', 'ugly');
```

In case of a failing expectation you get the following output:

```javascript
expect('Hello beautiful world!', 'not to contain', 'beautiful', 'ugly');
```

```output
expected 'Hello beautiful world!' not to contain 'beautiful', 'ugly'

Hello beautiful world!
      ^^^^^^^^^
```
