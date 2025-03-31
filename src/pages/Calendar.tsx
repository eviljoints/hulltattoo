import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Grid,
  Text,
  Flex,
  Select,
  Radio,
  RadioGroup,
  Stack
} from '@chakra-ui/react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import html2canvas from 'html2canvas';

// Import your new neon-lines CSS
import textCardStyles from '../components/TextCard.module.css';

// Types for availability per day.
type FullDayEntry = {
  type: 'full-day';
  status: 'free' | 'booked';
};

type TimeSlotEntry = {
  type: 'time-slot';
  range: { start: number; end: number };
};

type DayEntry = FullDayEntry | TimeSlotEntry;
type DayAvailability = Record<string, DayEntry>;

const ArtistCalendar: React.FC = () => {
  const [selectedArtist, setSelectedArtist] = useState('Mike');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dayAvailability, setDayAvailability] = useState<DayAvailability>({});
  const [editingDay, setEditingDay] = useState<Date | null>(null);
  const [panelEntryType, setPanelEntryType] = useState<'full-day' | 'time-slot'>('full-day');
  const [panelAvailability, setPanelAvailability] = useState<'free' | 'booked'>('booked');
  const [panelTimeSlotSelection, setPanelTimeSlotSelection] = useState<{ start: number | null; end: number | null }>({ start: null, end: null });
  const calendarRef = useRef<HTMLDivElement>(null);

  // Format a Date object into "YYYY-MM-DD"
  const formatDateKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Load availability from localStorage when month or artist changes
  useEffect(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthKey = `${selectedArtist}-${year}-${(month + 1).toString().padStart(2, '0')}`;
    const stored = localStorage.getItem(`dayAvailability-${monthKey}`);
    if (stored) {
      setDayAvailability(JSON.parse(stored));
    } else {
      // Initialize with default availability
      const defaultAvailability: DayAvailability = {};
      for (let d = 1; d <= daysInMonth; d++) {
        const current = new Date(year, month, d);
        const dayOfWeek = current.getDay(); // Sunday=0, Monday=1, ...
        defaultAvailability[formatDateKey(current)] = {
          type: 'full-day',
          status: dayOfWeek === 0 || dayOfWeek === 1 ? 'booked' : 'booked',
        };
      }
      setDayAvailability(defaultAvailability);
      localStorage.setItem(`dayAvailability-${monthKey}`, JSON.stringify(defaultAvailability));
    }
  }, [selectedDate, selectedArtist]);

  // Save availability to localStorage
  const saveAvailabilityToStorage = (newAvailability: DayAvailability) => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const monthKey = `${selectedArtist}-${year}-${(month + 1).toString().padStart(2, '0')}`;
    localStorage.setItem(`dayAvailability-${monthKey}`, JSON.stringify(newAvailability));
  };

  // Generate the grid structure for the calendar
  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); 
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const calendarCells: (Date | null)[] = [];

    // Push nulls to align the first day properly
    for (let i = 0; i < firstDay; i++) {
      calendarCells.push(null);
    }
    // Push actual dates
    for (let d = 1; d <= daysInMonth; d++) {
      calendarCells.push(new Date(year, month, d));
    }
    return calendarCells;
  };

  const calendarDays = generateCalendarDays();

  /**
   * Returns an array of 1-hour time slot strings from 9:30 to 3:30 (Tue–Sat).
   * Sunday (0) and Monday (1) return empty because they're "booked" / off.
   */
  const getTimeSlots = (date: Date): string[] => {
    const day = date.getDay();
    if (day === 0 || day === 1) return [];

    const slots: string[] = [];
    const startMinutes = 9 * 60 + 30;  // 9:30
    const endMinutes = 15 * 60 + 30;   // 15:30

    for (let t = startMinutes; t < endMinutes; t += 60) {
      // e.g. 9:30am-10:30am, 10:30am-11:30am, ...
      const startHr = Math.floor(t / 60);
      const startMin = t % 60;
      const endHr = Math.floor((t + 60) / 60);
      const endMin = (t + 60) % 60;

      const formatTime = (h: number, m: number) => {
        const suffix = h >= 12 ? 'pm' : 'am';
        const hour12 = h % 12 === 0 ? 12 : h % 12;
        return `${hour12}:${m.toString().padStart(2, '0')}${suffix}`;
      };

      slots.push(`${formatTime(startHr, startMin)}-${formatTime(endHr, endMin)}`);
    }
    return slots;
  };

  const handleDayClick = (date: Date) => {
    if (date.getDay() === 0 || date.getDay() === 1) return;
    setEditingDay(date);

    const key = formatDateKey(date);
    const entry = dayAvailability[key];
    if (entry) {
      if (entry.type === 'full-day') {
        setPanelEntryType('full-day');
        setPanelAvailability(entry.status);
        setPanelTimeSlotSelection({ start: null, end: null });
      } else {
        setPanelEntryType('time-slot');
        setPanelAvailability('free');
        setPanelTimeSlotSelection({
          start: entry.range.start,
          end: entry.range.end
        });
      }
    } else {
      // Default
      setPanelEntryType('full-day');
      setPanelAvailability('booked');
      setPanelTimeSlotSelection({ start: null, end: null });
    }
  };

  const handleTimeSlotClick = (index: number) => {
    if (panelTimeSlotSelection.start === null) {
      setPanelTimeSlotSelection({ start: index, end: null });
    } else if (panelTimeSlotSelection.end === null) {
      if (index === panelTimeSlotSelection.start) {
        setPanelTimeSlotSelection({ start: null, end: null });
      } else {
        setPanelTimeSlotSelection({
          start: panelTimeSlotSelection.start,
          end: index
        });
      }
    } else {
      setPanelTimeSlotSelection({ start: index, end: null });
    }
  };

  const isSlotInRange = (index: number) => {
    const { start, end } = panelTimeSlotSelection;
    if (start !== null && end !== null) {
      const [s, e] = [Math.min(start, end), Math.max(start, end)];
      return index >= s && index <= e;
    }
    return start === index;
  };

  // "9:30am-10:30am" => { start: "9:30am", end: "10:30am" }
  const parseSlotString = (slot: string) => {
    const [start, end] = slot.split('-');
    return { start, end };
  };

  const saveDayAvailability = () => {
    if (!editingDay) return;
    const key = formatDateKey(editingDay);

    let newEntry: DayEntry;
    if (panelEntryType === 'full-day') {
      newEntry = {
        type: 'full-day',
        status: panelAvailability
      };
    } else {
      const { start, end } = panelTimeSlotSelection;
      if (start === null || end === null) {
        alert('Please select a valid time slot range.');
        return;
      }
      newEntry = {
        type: 'time-slot',
        range: {
          start: Math.min(start, end),
          end: Math.max(start, end)
        }
      };
    }

    const newAvailability = { ...dayAvailability, [key]: newEntry };
    setDayAvailability(newAvailability);
    saveAvailabilityToStorage(newAvailability);

    // Clear the edit panel
    setEditingDay(null);
    setPanelTimeSlotSelection({ start: null, end: null });
  };

  const renderEditorPanel = () => {
    if (!editingDay) return null;
    const daySlots = getTimeSlots(editingDay);
    const isUnavailableDay = editingDay.getDay() === 0 || editingDay.getDay() === 1;

    return (
      <Box mt={4} p={4} border="2px solid #ff007f" bg="black" maxW="400px" mx="auto">
        <Text mb={2} color="white" fontFamily="Arial, sans-serif">
          Edit {editingDay.toDateString()}
        </Text>
        {isUnavailableDay ? (
          <Text color="white" fontFamily="Arial, sans-serif">
            This day is not editable.
          </Text>
        ) : (
          <>
            <Text mb={1} color="white" fontFamily="Arial, sans-serif">
              Select Entry Type:
            </Text>
            <RadioGroup
              value={panelEntryType}
              onChange={(val) => setPanelEntryType(val as 'full-day' | 'time-slot')}
            >
              <Stack direction="row" spacing={4}>
                <Radio value="full-day" colorScheme="pink" fontFamily="Arial, sans-serif">
                  Full Day
                </Radio>
                <Radio value="time-slot" colorScheme="pink" fontFamily="Arial, sans-serif">
                  Time Slot
                </Radio>
              </Stack>
            </RadioGroup>

            <Text mt={2} mb={1} color="white" fontFamily="Arial, sans-serif">
              Mark as:
            </Text>
            <RadioGroup
              value={panelAvailability}
              onChange={(val) => setPanelAvailability(val as 'free' | 'booked')}
            >
              <Stack direction="row" spacing={4}>
                <Radio value="free" colorScheme="pink" fontFamily="Arial, sans-serif">
                  Available
                </Radio>
                <Radio value="booked" colorScheme="pink" fontFamily="Arial, sans-serif">
                  Unavailable
                </Radio>
              </Stack>
            </RadioGroup>

            {panelEntryType === 'time-slot' && panelAvailability === 'free' && (
              <>
                <Text mt={2} color="white" fontFamily="Arial, sans-serif">
                  Select Time Slot Range:
                </Text>
                <Flex wrap="wrap" justify="center" gap={2} mt={2}>
                  {daySlots.map((slot, index) => (
                    <Button
                      key={slot}
                      onClick={() => handleTimeSlotClick(index)}
                      fontFamily="Arial, sans-serif"
                      bg={isSlotInRange(index) ? '#ff007f' : '#222'}
                      color="white"
                      _hover={{ bg: '#00d4ff' }}
                    >
                      {slot}
                    </Button>
                  ))}
                </Flex>
              </>
            )}

            <Flex justify="center" mt={4}>
              <Button
                onClick={saveDayAvailability}
                bg="#ff007f"
                color="white"
                fontFamily="Arial, sans-serif"
                _hover={{ bg: '#00d4ff' }}
              >
                Save
              </Button>
              <Button
                onClick={() => setEditingDay(null)}
                ml={4}
                variant="outline"
                color="white"
                fontFamily="Arial, sans-serif"
              >
                Cancel
              </Button>
            </Flex>
          </>
        )}
      </Box>
    );
  };

  const handleDownload = async () => {
    if (calendarRef.current) {
      const canvas = await html2canvas(calendarRef.current);
      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.href = image;
      link.download = 'artist-calendar.png';
      link.click();
    }
  };

  const renderCalendarGrid = () => (
    <Grid templateColumns="repeat(7, 1fr)" gap={2}>
      {calendarDays.map((date, idx) => {
        if (!date) {
          return <Box key={idx} />;
        }
        const key = formatDateKey(date);
        let bgColor = '#FF073A';
        let displayText = date.getDate().toString();
        const entry = dayAvailability[key];

        if (entry) {
          if (entry.type === 'full-day') {
            bgColor = entry.status === 'free' ? '#39FF14' : '#FF073A';
          } else {
            bgColor = '#007BFF';
            const slots = getTimeSlots(date);
            if (slots.length > 0 && entry.range.start < slots.length) {
              const endIndex = Math.min(entry.range.end, slots.length - 1);
              const firstSlot = parseSlotString(slots[entry.range.start]);
              const lastSlot = parseSlotString(slots[endIndex]);
              const combinedRange = `${firstSlot.start} - ${lastSlot.end}`;
              displayText = `${date.getDate()}\n${combinedRange}`;
            }
          }
        }

        const isEditable = date.getDay() !== 0 && date.getDay() !== 1;
        return (
          <Box
            key={idx}
            height="80px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontFamily="Arial, sans-serif"
            fontSize="xl"
            color="white"
            border="1px solid #ff007f"
            whiteSpace="pre-line"
            cursor={isEditable ? 'pointer' : 'default'}
            bg={bgColor}
            onClick={() => {
              if (isEditable) {
                handleDayClick(date);
              }
            }}
          >
            {displayText}
          </Box>
        );
      })}
    </Grid>
  );

  return (
    /* Outer container so .neonLines can sit behind everything */
    <Box position="relative" minH="100vh" fontFamily="Arial, sans-serif">
      
      {/* Neon diagonal lines from TextCard.module.css */}
      <div className={textCardStyles.neonLines}></div>

      {/* Main content */}
      <Box p={4} bg="black" minH="100vh" position="relative" zIndex={1}>
        <Text
          textAlign="center"
          fontSize="3xl"
          mb={4}
          color="white"
          fontFamily="Arial, sans-serif"
        >
          Artist Availability Calendar
        </Text>

        <Flex justify="center" mb={4}>
          <Select
            width="200px"
            value={selectedArtist}
            onChange={(e) => setSelectedArtist(e.target.value)}
            bg="black"
            border="2px solid #ff007f"
            color="white"
            fontFamily="Arial, sans-serif"
          >
            <option style={{ color: 'black' }} value="Mike">
              Mike
            </option>
            <option style={{ color: 'black' }} value="Poppy">
              Poppy (apprentice)
            </option>
            <option style={{ color: 'black' }} value="Harley">
              Harley (apprentice)
            </option>
          </Select>
        </Flex>

        <Flex justify="center" mb={4}>
          <DatePicker
            selected={selectedDate}
            onChange={(date: Date) => {
              setSelectedDate(date);
              setEditingDay(null);
            }}
            dateFormat="MMMM yyyy"
            showMonthYearPicker
          />
        </Flex>

        <Box
          ref={calendarRef}
          maxW="800px"
          mx="auto"
          p={4}
          border="2px solid #ff007f"
          bg="black"
        >
          <Text
            fontSize="3xl"
            textAlign="center"
            color="white"
            fontFamily="Arial, sans-serif"
            mb={2}
          >
            {selectedArtist} —{' '}
            {selectedDate.toLocaleString('default', {
              month: 'long',
              year: 'numeric'
            })}
          </Text>

          {renderCalendarGrid()}

          <Box mt={4}>
            <Flex justify="center" gap={4} wrap="wrap" fontFamily="Arial, sans-serif">
              <Flex align="center" gap={2}>
                <Box w="20px" h="20px" bg="#FF073A" border="1px solid white" />
                <Text color="white" fontFamily="Arial, sans-serif">
                  Booked (Full Day)
                </Text>
              </Flex>
              <Flex align="center" gap={2}>
                <Box w="20px" h="20px" bg="#39FF14" border="1px solid white" />
                <Text color="white" fontFamily="Arial, sans-serif">
                  Available (Full Day)
                </Text>
              </Flex>
              <Flex align="center" gap={2}>
                <Box w="20px" h="20px" bg="#007BFF" border="1px solid white" />
                <Text color="white" fontFamily="Arial, sans-serif">
                  Available (Time Slot)
                </Text>
              </Flex>
            </Flex>
          </Box>
        </Box>

        {renderEditorPanel()}

        <Flex justify="center" mt={4}>
          <Button
            onClick={handleDownload}
            bg="#ff007f"
            color="white"
            fontFamily="Arial, sans-serif"
            _hover={{ bg: '#00d4ff' }}
          >
            Download Calendar Image
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

export default ArtistCalendar;
