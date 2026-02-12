
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MobileNav from './components/MobileNav';
import AuthModal from './components/AuthModal';
import AdminDashboard from './components/AdminDashboard';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';
import AdminLogin from './components/AdminLogin';
import TourCard from './components/TourCard';
import { AppStatus, TourPackage, User } from './types';
import { dbService } from './services/dbService';

type ViewType = 'HOME' | 'INTERNATIONAL' | 'DOMESTIC' | 'PILGRIMAGE' | 'ABOUT' | 'CONTACT' | 'TOUR_DETAILS';

// Added missing highlights property to all objects in DEFAULT_TOURS to satisfy the TourPackage interface
const DEFAULT_TOURS: TourPackage[] = [
  // International Specials
  {
    id: 'intl-1',
    title: 'EUROPE SPL',
    category: 'International',
    destination: 'Europe',
    price: '₹1,45,000',
    priceBasis: 'Per Person',
    duration: '14 Nights - 15 Days',
    image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=800&auto=format&fit=crop',
    dates: '2025 Flexible',
    highlights: ['Paris Sightseeing', 'Disneyland Exhibit', 'Brussels Discovery', 'Amsterdam Canal Cruise', 'Swiss Alps Excursion'],
    features: ['Premium Accommodation', 'Inter-city Coach Transfers', 'Sightseeing as per Itinerary', 'Indian Packed Dinner'],
    itinerary: [
      {
        day: 1, title: 'Flight to Paris & City Tour', activities: [
          { time: 'Morning', activity: 'Arrival Paris', description: 'After immigration, start Paris city tour' },
          { time: 'Afternoon', activity: 'Paris City Tour', description: '2 Hour guided city tour', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop' },
          { time: 'Evening', activity: 'Hotel Check-in', description: '05.00pm check in and rest' },
          { time: 'Dinner', activity: 'Packed Dinner', description: 'Included' }
        ]
      },
      {
        day: 2, title: 'Eiffel Tower & Seine Cruise', activities: [
          { time: 'Breakfast', activity: 'Hotel Breakfast', description: '07.00am' },
          { time: 'Morning', activity: 'Eiffel Tower', description: '10.00am to 01.00pm visit', image: 'https://images.unsplash.com/photo-1543349689-9a4d426bee87?q=80&w=800&auto=format&fit=crop' },
          { time: 'Lunch', activity: 'Indian Lunch', description: '02.00pm' },
          { time: 'Afternoon', activity: 'Seine River Cruise', description: '03.00pm to 04.00pm' },
          { time: 'Evening', activity: 'Shopping', description: '04.00pm to 06.00pm free time' },
          { time: 'Dinner', activity: 'Dinner', description: '06.30pm at restaurant' }
        ]
      },
      {
        day: 3, title: 'Disneyland Adventure', activities: [
          { time: 'Breakfast', activity: 'Hotel Breakfast', description: '07.00am' },
          { time: 'Full Day', activity: 'DisneyLand Visit', description: '10.00am to 06.00pm explore both parks', image: 'https://images.unsplash.com/photo-1505308107314-998845fc8603?q=80&w=800&auto=format&fit=crop' },
          { time: 'Dinner', activity: 'Packed Dinner', description: 'Back to hotel' }
        ]
      },
      {
        day: 4, title: 'Paris to Brussels', activities: [
          { time: 'Breakfast', activity: 'Hotel Breakfast', description: '07.00am' },
          { time: 'Morning', activity: 'Transfer to Brussels', description: '08.00am hotel checkout (5 hrs drive)' },
          { time: 'Afternoon', activity: 'Atomium & Mini Europe', description: '01.00pm orientation tour with lunch' },
          { time: 'Highlight', activity: 'The Grand Place', description: '04.00pm visit', image: 'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?q=80&w=800&auto=format&fit=crop' },
          { time: 'Dinner', activity: 'Packed Dinner', description: 'Hotel check-in' }
        ]
      },
      {
        day: 5, title: 'Brussels to Amsterdam', activities: [
          { time: 'Breakfast', activity: 'Hotel Breakfast', description: '07.00am' },
          { time: 'Morning', activity: 'Transfer to Amsterdam', description: '3 hrs journey approx' },
          { time: 'Afternoon', activity: 'Zaanse Schans', description: 'Windmills & Cheese shop visit' },
          { time: 'Highlight', activity: 'Amsterdam Canal Cruise', description: 'Glass-top boat tour', image: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?q=80&w=800&auto=format&fit=crop' },
          { time: 'Dinner', activity: 'Packed Dinner', description: 'Hotel check-in' }
        ]
      },
      {
        day: 6, title: 'Amsterdam to Germany', activities: [
          { time: 'Breakfast', activity: 'Hotel Breakfast', description: '07.00am' },
          { time: 'Morning', activity: 'Transfer to Germany', description: 'Journey to Cologne (3.5 hrs)' },
          { time: 'Highlight', activity: 'Cologne Cathedral', description: '02.00pm UNESCO site visit', image: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?q=80&w=800&auto=format&fit=crop' },
          { time: 'Evening', activity: 'Transfer to Stuttgart', description: '03.00pm drive (4 hrs approx)' },
          { time: 'Dinner', activity: 'Packed Dinner', description: 'Hotel check-in at 08.00pm' }
        ]
      },
      {
        day: 7, title: 'Stuttgart to Switzerland', activities: [
          { time: 'Breakfast', activity: 'Hotel Breakfast', description: '07.00am' },
          { time: 'Morning', activity: 'Transfer to Swiss', description: '3 hrs drive approx' },
          { time: 'Lunch', activity: 'Drubba Cuckoo Clock', description: '12.00pm visit and lunch' },
          { time: 'Highlight', activity: 'Rhine Falls', description: '04.00pm visit largest falls', image: 'https://images.unsplash.com/photo-1610423984587-c57984852026?q=80&w=800&auto=format&fit=crop' },
          { time: 'Dinner', activity: 'Packed Dinner', description: 'Hotel check-in' }
        ]
      },
      {
        day: 8, title: 'Mount Titlis & Lucerne', activities: [
          { time: 'Breakfast', activity: 'Hotel Breakfast', description: '07.00am' },
          { time: 'Morning', activity: 'Mount Titlis', description: 'Rotair cable car visit', image: 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?q=80&w=800&auto=format&fit=crop' },
          { time: 'Lunch', activity: 'Indian Lunch', description: '01.00pm at Lucerne' },
          { time: 'Afternoon', activity: 'Lucerne Orientation', description: 'Lion Monument & Chapel Bridge' },
          { time: 'Dinner', activity: 'Packed Dinner', description: '07.00pm in Zurich' }
        ]
      },
      {
        day: 9, title: 'Jungfraujoch Interlaken', activities: [
          { time: 'Breakfast', activity: 'Hotel Breakfast', description: '07.00am' },
          { time: 'Full Day', activity: 'Jungfraujoch', description: 'Mount of Interlaken visit', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop' },
          { time: 'Dinner', activity: 'Grand Dinner', description: '08.00pm' }
        ]
      },
      {
        day: 10, title: 'Switzerland to Venice', activities: [
          { time: 'Breakfast', activity: 'Hotel Breakfast', description: '07.00am' },
          { time: 'Morning', activity: 'Transfer to Italy', description: 'Proceed to Venice (6 hrs drive)' },
          { time: 'Afternoon', activity: 'Venice Walking Tour', description: 'St. Marks Basilica & Square' },
          { time: 'Highlight', activity: 'Gondola Ride', description: '25 min romantic boat ride', image: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?q=80&w=800&auto=format&fit=crop' },
          { time: 'Dinner', activity: 'Packed Dinner', description: 'Hotel check-in at 08.00pm' }
        ]
      },
      {
        day: 11, title: 'Venice to Florence & Pisa', activities: [
          { time: 'Breakfast', activity: 'Hotel Breakfast', description: '08.00am' },
          { time: 'Morning', activity: 'Transfer to Florence', description: '3 hrs drive approx' },
          { time: 'Afternoon', activity: 'Florence Sightseeing', description: '02.00pm to 04.30pm tour', image: 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?q=80&w=800&auto=format&fit=crop' },
          { time: 'Evening', activity: 'Transfer to Pisa', description: 'Journey to the Leaning Tower' },
          { time: 'Dinner', activity: 'Dinner & Stay', description: 'Hotel check-in' }
        ]
      },
      {
        day: 12, title: 'Pisa to Rome', activities: [
          { time: 'Breakfast', activity: 'Hotel Breakfast', description: '07.00am' },
          { time: 'Morning', activity: 'Leaning Tower of Pisa', description: '09.00am iconic visit', image: 'https://images.unsplash.com/photo-1543349689-9a4d426bee87?q=80&w=800&auto=format&fit=crop' },
          { time: 'Afternoon', activity: 'Transfer to Rome', description: '02.00pm drive (4 hrs approx)' },
          { time: 'Dinner', activity: 'Packed Dinner', description: 'Check-in at 06.00pm' }
        ]
      },
      {
        day: 13, title: 'Vatican & Trevi Fountain', activities: [
          { time: 'Breakfast', activity: 'Hotel Breakfast', description: '08.00am' },
          { time: 'Morning', activity: 'Vatican Tour', description: 'Vatican Museum admission included', image: 'https://images.unsplash.com/photo-1531572700774-c7d5f8025826?q=80&w=800&auto=format&fit=crop' },
          { time: 'Afternoon', activity: 'Trevi Fountain', description: '04.00pm visit and coins toss' },
          { time: 'Dinner', activity: 'Packed Dinner', description: 'Hotel rest' }
        ]
      },
      {
        day: 14, title: 'Colosseum & Shopping', activities: [
          { time: 'Breakfast', activity: 'Hotel Breakfast', description: '07.00am' },
          { time: 'Morning', activity: 'Colosseum Visit', description: '10.00am ancient arena visit', image: 'https://images.unsplash.com/photo-1581274050302-581149d3b4c5?q=80&w=800&auto=format&fit=crop' },
          { time: 'Afternoon', activity: 'Shopping Spree', description: 'Porta di Roma Galleria commerciale' },
          { time: 'Dinner', activity: 'Final Feast', description: 'Packed dinner at hotel' }
        ]
      },
      {
        day: 15, title: 'Departure for Home', activities: [
          { time: 'Morning', activity: 'Flight Home', description: '06.00am Airport drop for Hyderabad flight', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109c0f?q=80&w=800&auto=format&fit=crop' }
        ]
      }
    ]
  },
  {
    id: 'intl-2',
    title: 'BALI SPECIAL TOUR',
    category: 'International',
    destination: 'Bali',
    price: '₹55,000',
    priceBasis: 'Per Person',
    duration: '4 Nights - 5 Days',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800&auto=format&fit=crop',
    dates: '2025 Flexible',
    highlights: ['Pirates Dinner Cruise', 'Kintamani Volcano', 'Tanah Lot Sunset', 'Ubud Village Market', 'Tanjung Benoa Beach'],
    features: ['4* Hotel Accommodation', 'Kintamani Volcano Tour', 'Uluwatu & Ubud Temple Tour', 'All Meals Included', 'Private Transfers'],
    itinerary: [
      {
        day: 1, title: 'Arrival & Pirates Dinner Cruise', activities: [
          { time: 'Morning', activity: 'Flight to Bali', description: 'Arrival and immigration' },
          { time: 'Lunch', activity: 'Local Lunch', description: 'Proceed to traditional Balinese lunch' },
          { time: 'Check-in', activity: 'Hotel Check-in', description: 'Rest and relax' },
          { time: 'Evening', activity: 'Pirates Dinner Cruise', description: 'International Buffet with live entertainment', image: 'https://images.unsplash.com/photo-1544911845-1f34a3eb46b1?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 2, title: 'Kintamani & Ubud Culture', activities: [
          { time: 'Morning', activity: 'Kintamani Volcano', description: 'Panoramic view of Mount Batur', image: 'https://images.unsplash.com/photo-1554443689-d10d603a165b?q=80&w=800&auto=format&fit=crop' },
          { time: 'Afternoon', activity: 'Ubud Village', description: 'Art village and traditional market' },
          { time: 'Lunch', activity: 'Volcano View Lunch', description: 'Enjoy lunch with Batur view' }
        ]
      },
      {
        day: 3, title: 'Beach Adventure & Uluwatu', activities: [
          { time: 'Morning', activity: 'Tanjung Benoa Beach', description: 'Banana Boat, Glass Bottom Boat & Turtle Island', image: 'https://images.unsplash.com/photo-1539367628448-2b1c48117283?q=80&w=800&auto=format&fit=crop' },
          { time: 'Afternoon', activity: 'Uluwatu Cliff Temple', description: 'Ancient temple on the high cliff' },
          { time: 'Evening', activity: 'Seafood Dinner', description: 'Sunset dinner' }
        ]
      },
      {
        day: 4, title: 'Kuta Shopping & Tanah Lot', activities: [
          { time: 'Morning', activity: 'Kuta Shopping', description: 'Explore Kuta markets and malls' },
          { time: 'Afternoon', activity: 'Tanah Lot Temple', description: 'Iconic offshore temple at sunset', image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 5, title: 'Departure', activities: [
          { time: 'Morning', activity: 'Airport Drop', description: 'Hotel check-out and flight home', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109c0f?q=80&w=800&auto=format&fit=crop' }
        ]
      }
    ]
  },
  {
    id: 'intl-3',
    title: 'MALDIVES SPECIAL PACKAGE',
    category: 'International',
    destination: 'Maldives',
    price: '₹75,000',
    priceBasis: 'Per Person',
    duration: '3 Nights - 4 Days',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=800&auto=format&fit=crop',
    dates: '2025 Flexible',
    highlights: ['Shared Speed Boat Transfer', 'Water Sports Leisure', 'Local Island Tour', 'Overwater Views'],
    features: ['3 Nights Hotel Accommodation', 'Full Board Meals (B,L,D)', 'Airport Speed Boat Transfers', 'Island Orientation'],
    itinerary: [
      {
        day: 1, title: 'Arrival & Speed Boat Transfer', activities: [
          { time: 'Morning', activity: 'Flight to Maldives', description: 'Arrival and immigration' },
          { time: 'Afternoon', activity: 'Speed Boat Transfer', description: 'Transfer to island resort by shared boat', image: 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?q=80&w=800&auto=format&fit=crop' },
          { time: 'Evening', activity: 'Resort Check-in', description: 'Relax by the ocean' }
        ]
      },
      {
        day: 2, title: 'Leisure & Water Sports', activities: [
          { time: 'Breakfast', activity: 'Resort Breakfast', description: '07.30am' },
          { time: 'Full Day', activity: 'Leisure / Water Sports', description: 'Enjoy snorkeling or beach relaxation', image: 'https://images.unsplash.com/photo-1506953823976-52e1bdc0149a?q=80&w=800&auto=format&fit=crop' },
          { time: 'Lunch', activity: 'International Lunch', description: '01.30pm' },
          { time: 'Dinner', activity: 'Resort Dinner', description: '08.30pm buffet' }
        ]
      },
      {
        day: 3, title: 'Local Island Exploration', activities: [
          { time: 'Breakfast', activity: 'Resort Breakfast', description: '07.30am' },
          { time: 'Full Day', activity: 'Local Island Tour', description: 'Explore the culture and lifestyle of the islands', image: 'https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?q=80&w=800&auto=format&fit=crop' },
          { time: 'Lunch', activity: 'Resort Lunch', description: '01.30pm' },
          { time: 'Dinner', activity: 'Grand Dinner', description: '08.30pm' }
        ]
      },
      {
        day: 4, title: 'Departure', activities: [
          { time: 'Morning', activity: 'Airport Transfer', description: 'Shared speed boat back to Malé Airport', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109c0f?q=80&w=800&auto=format&fit=crop' },
          { time: 'Afternoon', activity: 'Flight Home', description: 'Board your flight back to Hyderabad' }
        ]
      }
    ]
  },
  {
    id: 'intl-4',
    title: 'SINGAPORE & MALAYSIA SPECIAL',
    category: 'International',
    destination: 'Singapore & Malaysia',
    price: '₹85,000',
    priceBasis: 'Per Person',
    duration: '5 Nights - 6 Days',
    image: 'https://images.unsplash.com/photo-1525596662741-e94ff9f26de1?q=80&w=800&auto=format&fit=crop',
    dates: '2025 Flexible',
    highlights: ['Universal Studios & SEA Aquarium', 'Night Safari Adventure', 'Sentosa Island Cable Car', 'Genting Highlands', 'Batu Caves'],
    features: ['Flights Included (HYD base)', 'Singapore & Malaysia Visas', '3* Hotel Accommodation', 'Full Board Meals (B,L,D)', 'Deluxe Coach Transfers'],
    itinerary: [
      {
        day: 1, title: 'Arrival Singapore & Night Safari', activities: [
          { time: 'Morning', activity: 'Arrival Singapore', description: 'Fresh up and start City Tour with Flyer' },
          { time: 'Afternoon', activity: 'Hotel Check-in', description: '02.00pm rest and relax' },
          { time: 'Evening', activity: 'Night Safari', description: '05.00pm pick up for nocturnal animal tour', image: 'https://images.unsplash.com/photo-1562914316-ea39665bc7f4?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 2, title: 'Universal Studios', activities: [
          { time: 'Full Day', activity: 'Universal Studios', description: 'Full day adventure with rides and shows', image: 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?q=80&w=800&auto=format&fit=crop' },
          { time: 'Dinner', activity: 'Indian Dinner', description: '08.30pm at restaurant' }
        ]
      },
      {
        day: 3, title: 'Gardens by the Bay & Sentosa', activities: [
          { time: 'Morning', activity: 'Gardens by the Bay', description: 'Visit the futuristic nature park' },
          { time: 'Afternoon', activity: 'Sentosa Island', description: 'Cable Car ride, Madam Tussauds, and Wings of Time', image: 'https://images.unsplash.com/photo-1531572700774-c7d5f8025826?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 4, title: 'Transfer to Kuala Lumpur', activities: [
          { time: 'Morning', activity: 'Departure for Malaysia', description: 'Coach journey via Malacca (Enroute Lunch)', image: 'https://images.unsplash.com/photo-1528181304800-2f140819898f?q=80&w=800&auto=format&fit=crop' },
          { time: 'Afternoon', activity: 'KL City Tour', description: 'Orientation tour of the capital city' }
        ]
      },
      {
        day: 5, title: 'Batu Caves & Genting Highlands', activities: [
          { time: 'Morning', activity: 'Batu Caves', description: 'Visit the iconic golden Murugan statue', image: 'https://images.unsplash.com/photo-1560241076-2481005a3068?q=80&w=800&auto=format&fit=crop' },
          { time: 'Afternoon', activity: 'Genting Highlands', description: 'Ride the skyway cable car' }
        ]
      },
      {
        day: 6, title: 'Petronas Towers & Departure', activities: [
          { time: 'Morning', activity: 'Petronas Twin Towers', description: 'Visit the world\'s tallest twin towers', image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?q=80&w=800&auto=format&fit=crop' },
          { time: 'Night', activity: 'Flight Home', description: 'Departure from KUL to Hyderabad' }
        ]
      }
    ]
  },
  {
    id: 'intl-5',
    title: 'BANGKOK - PATTAYA - PHUKET SPECIAL',
    category: 'International',
    destination: 'Thailand',
    price: '₹55,000',
    priceBasis: 'Per Person',
    duration: '5 Nights - 6 Days',
    image: 'https://images.unsplash.com/photo-1528181304800-2f140819898f?q=80&w=800&auto=format&fit=crop',
    dates: '2025 Flexible',
    highlights: ['Phi Phi Island Speedboat Tour', 'Coral Island Water Sports', 'Alcazar Cabaret Show', 'Chao Phraya Dinner Cruise', 'Nong Nooch Village'],
    features: ['Flights Included', '2N Phuket, 2N Pattaya, 1N Bangkok', 'Phi Phi & Coral Island Tours', 'Daily Breakfast & Indian Meals', 'PVT Transfers'],
    itinerary: [
      {
        day: 1, title: 'Arrival Bangkok & Pattaya Transfer', activities: [
          { time: 'Morning', activity: 'Arrival Bangkok', description: 'Meet and Greet then journey to Pattaya' },
          { time: 'Afternoon', activity: 'Nong Nooch Village', description: 'Exploration of tropical gardens and shows', image: 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 2, title: 'Coral Island & Alcazar Show', activities: [
          { time: 'Morning', activity: 'Coral Island', description: 'Speedboat ride for water sports and beach time' },
          { time: 'Evening', activity: 'Alcazar Show', description: 'World-famous cabaret performance', image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 3, title: 'Flight to Phuket', activities: [
          { time: 'Morning', activity: 'Transfer to Phuket', description: 'Flight from Bangkok to Phuket', image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=800&auto=format&fit=crop' },
          { time: 'Afternoon', activity: 'Resort Check-in', description: 'Leisure time' }
        ]
      },
      {
        day: 4, title: 'Phi Phi Island Excursion', activities: [
          { time: 'Full Day', activity: 'Phi Phi Island', description: 'Speedboat tour of Maya Bay and snorkeling', image: 'https://images.unsplash.com/photo-1528181304800-2f140819898f?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 5, title: 'Bangkok City & Dinner Cruise', activities: [
          { time: 'Evening', activity: 'Chao Phraya Dinner Cruise', description: 'Luxury cruise with live music and buffet', image: 'https://images.unsplash.com/photo-1562914316-ea39665bc7f4?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 6, title: 'Temple Tour & Shopping', activities: [
          { time: 'Afternoon', activity: 'Bangkok Temple Tour', description: 'Visit Golden Buddha and Marble Temple', image: 'https://images.unsplash.com/photo-1528181304800-2f140819898f?q=80&w=800&auto=format&fit=crop' }
        ]
      }
    ]
  },
  {
    id: 'intl-6',
    title: 'SRILANKA RAMAYANA TOUR',
    category: 'International',
    destination: 'Srilanka',
    price: '₹58,000',
    priceBasis: 'Per Person',
    duration: '5 Nights - 6 Days',
    image: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?q=80&w=800&auto=format&fit=crop',
    dates: '2025 Flexible',
    highlights: ['Shankari Devi Shakti Peetam', 'Sita Ashoka Vatika', 'Kandy Tooth Relic Temple', 'Sigiriya Lion Rock View', 'Muneeswaran Temple'],
    features: ['Flights Included (HYD base)', 'Visa Charges Included', '3* Hotel Accommodation', 'Full Board Meals (B,L,D)', 'AC Vehicle Transportation'],
    itinerary: [
      {
        day: 1, title: 'Arrival & Ancient Temples', activities: [
          { time: 'Morning', activity: 'Arrival Colombo', description: 'Airport pickup and lunch' },
          { time: 'Afternoon', activity: 'Muneeswaran Temple', description: 'Ancient temple visit', image: 'https://images.unsplash.com/photo-1620619767323-af6cf628705e?q=80&w=800&auto=format&fit=crop' },
          { time: 'Evening', activity: 'Manalvari Temple', description: 'Spiritual visit' }
        ]
      },
      {
        day: 2, title: 'Shakti Peetam & Sigiriya', activities: [
          { time: 'Morning', activity: 'Shankari Devi Shakti Peetam', description: 'Sacred visit', image: 'https://images.unsplash.com/photo-1625411786196-0158a2d1844b?q=80&w=800&auto=format&fit=crop' },
          { time: 'Afternoon', activity: 'Dambulla Golden Buddha', description: 'Temple visit' },
          { time: 'Evening', activity: 'Sigiriya View', description: 'Lion Rock outside' }
        ]
      },
      {
        day: 3, title: 'Journey to Kandy', activities: [
          { time: 'Morning', activity: 'Spice Garden Visit', description: 'Herbal plants tour' },
          { time: 'Afternoon', activity: 'Temple of the Tooth Relic', description: 'Sacred Kandy relic temple', image: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 4, title: 'Ramayana Trail - Nuwara Eliya', activities: [
          { time: 'Morning', activity: 'Ramboda Hanuman Temple', description: 'Tea garden darshan' },
          { time: 'Afternoon', activity: 'Sita Ashoka Vatika', description: 'Mythological garden visit', image: 'https://images.unsplash.com/photo-1596402184320-417d717867cd?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 5, title: 'Colombo City & Shopping', activities: [
          { time: 'Afternoon', activity: 'Vibhishana Temple', description: 'Ancient temple visit', image: 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?q=80&w=800&auto=format&fit=crop' },
          { time: 'Evening', activity: 'Colombo Shopping', description: 'Souvenir hunting' }
        ]
      },
      {
        day: 6, title: 'Departure', activities: [
          { time: 'Morning', activity: 'Airport Drop', description: 'Flight back home', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109c0f?q=80&w=800&auto=format&fit=crop' }
        ]
      }
    ]
  },
  {
    id: 'intl-7',
    title: 'KAILASH - MANASAROVAR YATRA',
    category: 'International',
    destination: 'Tibet',
    price: '₹1,85,000',
    priceBasis: 'Per Person',
    duration: '13 Nights - 14 Days',
    image: 'https://images.unsplash.com/photo-1627819077015-88636c9a513e?q=80&w=800&auto=format&fit=crop',
    dates: '2025 Flexible',
    highlights: ['Mount Kailash Parikrama', 'Holy Bath at Manasarovar', 'Lhasa & Kathmandu Sightseeing', 'Yamadwar Ritual', 'Sacred Gauri Kund'],
    features: ['Flights (Via Delhi)', 'Tibet Permit & China Visa', 'Nepal & Tibet Accommodation', 'Pure Veg Meals', 'Sherpa Support Staff'],
    itinerary: [
      {
        day: 1, title: 'Arrival Kathmandu', activities: [
          { time: 'Morning', activity: 'Flight to Kathmandu', description: 'Journey from Hyderabad', image: 'https://images.unsplash.com/photo-1544256718-3bcf237f3974?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 2, title: 'Kathmandu Sightseeing', activities: [
          { time: 'Morning', activity: 'Pashupatinath Temple', description: 'Sacred Shiva temple', image: 'https://images.unsplash.com/photo-1544256718-3bcf237f3974?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 3, title: 'Journey to Syabrubesi', activities: [
          { time: 'Morning', activity: 'Scenic Drive', description: 'Drive to border town', image: 'https://images.unsplash.com/photo-1544256718-3bcf237f3974?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 4, title: 'Cross Border to Kerung', activities: [
          { time: 'Morning', activity: 'China Immigration', description: 'Enter Tibet', image: 'https://images.unsplash.com/photo-1546708973-b339540b5162?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 5, title: 'Acclimatization', activities: [
          { time: 'Full Day', activity: 'Rest & Adaptation', description: 'Kerung rest' }
        ]
      },
      {
        day: 6, title: 'Drive to Saga', activities: [
          { time: 'Morning', activity: 'Plateau Drive', description: 'Through high altitude plains', image: 'https://images.unsplash.com/photo-1627819077015-88636c9a513e?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 7, title: 'Arrival Manasarovar', activities: [
          { time: 'Evening', activity: 'First Darshan', description: 'Vision of Kailash', image: 'https://images.unsplash.com/photo-1627819077015-88636c9a513e?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 8, title: 'Holy Bath & Darchen', activities: [
          { time: 'Morning', activity: 'Sacred Dip', description: 'Pooja at Manasarovar', image: 'https://images.unsplash.com/photo-1627819077015-88636c9a513e?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 9, title: 'YamaDwar & Parikrama', activities: [
          { time: 'Morning', activity: 'YamaDwar Ritual', description: 'Gateway to parikrama', image: 'https://images.unsplash.com/photo-1627819077015-88636c9a513e?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 10, title: 'Parikrama Day 2', activities: [
          { time: 'Morning', activity: 'Golden View', description: 'Sunrise on Kailash', image: 'https://images.unsplash.com/photo-1627819077015-88636c9a513e?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 11, title: 'Final Parikrama', activities: [
          { time: 'Morning', activity: 'Final Trek', description: 'Return to Saga' }
        ]
      },
      {
        day: 12, title: 'Return Journey', activities: [
          { time: 'Morning', activity: 'Tibet Drive', description: 'Heading back' }
        ]
      },
      {
        day: 13, title: 'Return Kathmandu', activities: [
          { time: 'Morning', activity: 'Border Crossing', description: 'Back to Nepal capital' }
        ]
      },
      {
        day: 14, title: 'Departure', activities: [
          { time: 'Morning', activity: 'Airport Drop', description: 'Flight back home', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109c0f?q=80&w=800&auto=format&fit=crop' }
        ]
      }
    ]
  },
  {
    id: 'intl-8',
    title: 'BANGKOK-PATTAYA SPECIAL',
    category: 'International',
    destination: 'Thailand',
    price: '₹35,000',
    priceBasis: 'Per Person',
    duration: '4 Nights - 5 Days',
    image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=800&auto=format&fit=crop',
    dates: '2025 Flexible',
    highlights: ['Al Cazar Show', 'Coral Island Boat Trip', 'Nong Nooch Village', 'Marble Temple & Golden Buddha'],
    features: ['Hotel Accommodation in Pattaya & Bangkok', 'All Inclusive Meals (B,L,D)', 'Entry Tickets as per Itinerary', 'PVT Basis Transfers'],
    itinerary: [
      {
        day: 1, title: 'Arrival & Alcazar Show', activities: [
          { time: 'Morning', activity: 'Arrival Bangkok', description: 'Journey to Pattaya' },
          { time: 'Afternoon', activity: 'Check-in', description: 'Hotel rest' },
          { time: 'Evening', activity: 'Alcazar Show', description: 'Grand cabaret show', image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 2, title: 'Coral Island Adventure', activities: [
          { time: 'Morning', activity: 'Coral Island', description: 'Boat trip with lunch', image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 3, title: 'Nong Nooch Cultural Village', activities: [
          { time: 'Morning', activity: 'Nong Nooch Village', description: 'Garden and show visit', image: 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 4, title: 'Pattaya to Bangkok', activities: [
          { time: 'Afternoon', activity: 'Transfer to Bangkok', description: 'City orientation and check-in', image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579367?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 5, title: 'Temple Tour & Departure', activities: [
          { time: 'Morning', activity: 'Golden Buddha & Marble Temple', description: 'Ancient temple visit', image: 'https://images.unsplash.com/photo-1528181304800-2f140819898f?q=80&w=800&auto=format&fit=crop' },
          { time: 'Night', activity: 'Flight Home', description: 'Departure for Hyderabad' }
        ]
      }
    ]
  },
  {
    id: 'intl-9',
    title: 'DUBAI SPECIAL TOUR',
    category: 'International',
    destination: 'Dubai',
    price: '₹62,000',
    priceBasis: 'Per Person',
    duration: '4 Nights - 5 Days',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop',
    dates: '2025 Flexible',
    highlights: ['Burj Khalifa 124th Floor', 'Desert Safari with BBQ', 'Miracle Garden', 'Future Museum', 'Marina Cruise Dinner'],
    features: ['Flights Included', '4N Hotel Accommodation', 'UAE Tourist Visa', 'All Meals Included', 'Private Transfers'],
    itinerary: [
      {
        day: 1, title: 'Arrival & Marina Cruise', activities: [
          { time: 'Morning', activity: 'Arrival Dubai', description: 'Airport pickup and check-in' },
          { time: 'Evening', activity: 'Marina Dinner Cruise', description: 'Starlight buffet on a traditional Dhow', image: 'https://images.unsplash.com/photo-1489516408517-0c0a15662682?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 2, title: 'Miracle Garden & Burj Khalifa', activities: [
          { time: 'Morning', activity: 'Miracle Garden', description: 'World\'s largest natural flower garden' },
          { time: 'Evening', activity: 'Burj Khalifa Top', description: 'Sky-high views from 124th floor', image: 'https://images.unsplash.com/photo-1526495124232-a02e1849118a?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 3, title: 'Abu Dhabi City Tour', activities: [
          { time: 'Morning', activity: 'Sheikh Zayed Mosque', description: 'Visit the architectural masterpiece', image: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?q=80&w=800&auto=format&fit=crop' },
          { time: 'Afternoon', activity: 'Ferrari World', description: 'Photo stop' }
        ]
      },
      {
        day: 4, title: 'Future Museum & Desert Safari', activities: [
          { time: 'Afternoon', activity: 'Desert Safari', description: 'Dune bashing and BBQ dinner', image: 'https://images.unsplash.com/photo-1454431936131-44558ef9c792?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 5, title: 'Gold Souq & Departure', activities: [
          { time: 'Morning', activity: 'Shopping at Gold Souq', description: 'Explore traditional markets', image: 'https://images.unsplash.com/photo-1445991842772-097fea258e7b?q=80&w=800&auto=format&fit=crop' },
          { time: 'Night', activity: 'Flight Home', description: 'Departure for Hyderabad' }
        ]
      }
    ]
  },

  // Domestic Specials
  {
    id: 'dom-1',
    title: 'CHARDHAM SPECIAL PACKAGE',
    category: 'Domestic',
    destination: 'Uttarakhand',
    price: '₹35,000',
    priceBasis: 'Per Person',
    duration: '13 Nights - 14 Days',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop',
    dates: '2025 Flexible',
    highlights: ['Yamunotri & Gangotri Temples', 'Kedarnath & Badrinath Darshan', 'Akshardham Temple Delhi', 'Ganga Harathi Haridwar', 'Mana Village Visit'],
    features: ['AC Vehicle Road Transportation', 'All Meals Included (B,L,D)', 'AC Accommodation (Twin Sharing)', 'Daily Mineral Water', 'PVT Transfers'],
    itinerary: [
      {
        day: 1, title: 'Arrival Delhi & Akshardham', activities: [
          { time: 'Morning', activity: 'Arrival Delhi', description: 'Pickup from Airport/Railway Station and hotel check-in' },
          { time: 'Afternoon', activity: 'Akshardham Temple', description: 'Visit the architectural marvel after lunch', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 2, title: 'Delhi Sightseeing & Haridwar', activities: [
          { time: 'Morning', activity: 'Delhi Local Tour', description: 'Visit historical landmarks of the capital city', image: 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=800&auto=format&fit=crop' },
          { time: 'Afternoon', activity: 'Journey to Haridwar', description: 'Travel to the holy city of Haridwar' }
        ]
      },
      {
        day: 3, title: 'Haridwar Temples & Ganga Aarti', activities: [
          { time: 'Morning', activity: 'Temple Visits', description: 'Visit Manasa Devi and Chandi Devi Temples' },
          { time: 'Evening', activity: 'Ganga Harathi', description: 'Experience the mystical Ganga Aarti at Har Ki Pauri', image: 'https://images.unsplash.com/photo-1551632432-c735e847665b?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 4, title: 'Journey to Ranachatti', activities: [
          { time: 'All Day', activity: 'Scenic Drive', description: 'Journey starts towards Ranachatti through the hills', image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 5, title: 'Yamunotri Temple Darshan', activities: [
          { time: 'Morning', activity: 'Yamunotri Trek', description: 'Darshan at Yamunotri Temple via JanakiChatti (Walk/Doli/Horse)', image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 6, title: 'Journey to Uttarkashi', activities: [
          { time: 'Afternoon', activity: 'Kashi Viswanath Temple', description: 'Visit the ancient temple in Uttarkashi', image: 'https://images.unsplash.com/photo-1620619767323-af6cf628705e?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 7, title: 'Gangotri Temple Visit', activities: [
          { time: 'Morning', activity: 'Gangotri Darshan', description: 'Holy bath and visit to Gangotri Temple', image: 'https://images.unsplash.com/photo-1596402184320-417d717867cd?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 8, title: 'Journey to Rampur', activities: [
          { time: 'All Day', activity: 'Transfer to Rampur', description: 'Travel through the breathtaking Himalayan landscapes', image: 'https://images.unsplash.com/photo-1620619767323-af6cf628705e?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 9, title: 'Kedarnath Temple Darshan', activities: [
          { time: 'Full Day', activity: 'Kedarnath Visit', description: 'Trek or fly to the sacred Kedarnath Temple for Darshan', image: 'https://images.unsplash.com/photo-1620619767323-af6cf628705e?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 10, title: 'Kedar Valley Rest', activities: [
          { time: 'Full Day', activity: 'Leisure & Rest', description: 'Relax at Rampur after the spiritual trek', image: 'https://images.unsplash.com/photo-1620619767323-af6cf628705e?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 11, title: 'Journey to Badrinath', activities: [
          { time: 'All Day', activity: 'Transfer to Badrinath', description: 'Drive to the final Dham of the circuit', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 12, title: 'Badrinath & Mana Village', activities: [
          { time: 'Morning', activity: 'Badrinath Temple', description: 'Visit the temple and attend Brahmakapalam Poojas' },
          { time: 'Afternoon', activity: 'Mana Village', description: 'Visit the last village of India', image: 'https://images.unsplash.com/photo-1621648293022-7740f938d821?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 13, title: 'Rishikesh Sightseeing & Haridwar', activities: [
          { time: 'Morning', activity: 'Transfer to Rishikesh', description: 'Travel descending the hills' },
          { time: 'Evening', activity: 'Rishikesh Tour', description: 'Visit Laxman Jhula and local sights', image: 'https://images.unsplash.com/photo-1598460616145-2f808f90680c?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 14, title: 'Return Journey to Delhi', activities: [
          { time: 'Morning', activity: 'Drive to Delhi', description: 'Travel back to the capital city' },
          { time: 'Afternoon', activity: 'Departure', description: 'Drop at Airport/Railway Station for return flight', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109c0f?q=80&w=800&auto=format&fit=crop' }
        ]
    ]
  },
  { id: 'dom-2', title: 'NORTH INDIA', category: 'Domestic', destination: 'North India', price: '₹28,000', priceBasis: 'Per Person', duration: '8 Days', image: 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=800&auto=format&fit=crop', dates: '2025 Flexible', highlights: ['Agra Taj Mahal', 'Jaipur Pink City', 'Delhi Historic Tour'] },
  { id: 'dom-3', title: 'NAIMISARANYAM KASHI-GAYA', category: 'Domestic', destination: 'UP/Bihar', price: '₹25,000', priceBasis: 'Per Person', duration: '10 Days', image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=800&auto=format&fit=crop', dates: '2025 Flexible', highlights: ['Ganga Aarti', 'Pinda Pradhan', 'Naimisaranyam Darshan'] },
  { id: 'dom-4', title: 'YAMUNOTRI', category: 'Domestic', destination: 'Uttarakhand', price: '₹12,000', priceBasis: 'Per Person', duration: '4 Days', image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800&auto=format&fit=crop', dates: '2025 Flexible', highlights: ['Yamunotri Temple', 'Janki Chatti'] },
  { id: 'dom-5', title: 'RAJASTHAN', category: 'Domestic', destination: 'Rajasthan', price: '₹32,000', priceBasis: 'Per Person', duration: '9 Days', image: 'https://images.unsplash.com/photo-1599661046289-e31897c93e14?q=80&w=800&auto=format&fit=crop', dates: '2025 Flexible', highlights: ['Udaipur Lakes', 'Jaisalmer Desert Safari'] },
  { id: 'dom-6', title: 'KASHI', category: 'Domestic', destination: 'Varanasi', price: '₹10,500', priceBasis: 'Per Person', duration: '3 Days', image: 'https://images.unsplash.com/photo-1590050752117-23a9d7fc9ba3?q=80&w=800&auto=format&fit=crop', dates: '2025 Flexible', highlights: ['Kashi Vishwanath', 'Ghats of Varanasi'] },
  { id: 'dom-7', title: 'GUJARAT', category: 'Domestic', destination: 'Gujarat', price: '₹26,000', priceBasis: 'Per Person', duration: '7 Days', image: 'https://images.unsplash.com/photo-1590487332731-081491740b28?q=80&w=800&auto=format&fit=crop', dates: '2025 Flexible', highlights: ['Statue of Unity', 'Rann of Kutch'] },
  { id: 'dom-8', title: 'TAMIL NADU', category: 'Domestic', destination: 'Tamil Nadu', price: '₹22,000', priceBasis: 'Per Person', duration: '6 Days', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop', dates: '2025 Flexible', highlights: ['Madurai Meenakshi', 'Rameshwaram'] },
  { id: 'dom-9', title: 'KERALA - SHIMLA - MANALI', category: 'Domestic', destination: 'Hill Stations', price: '₹42,000', priceBasis: 'Per Person', duration: '12 Days', image: 'https://images.unsplash.com/photo-1602216056096-3c40cc0c9944?q=80&w=800&auto=format&fit=crop', dates: '2025 Flexible', highlights: ['Munnar Tea Gardens', 'Shimla Mall Road', 'Rohtang Pass'] },
  { id: 'dom-10', title: 'KASHMIR', category: 'Domestic', destination: 'Kashmir', price: '₹34,000', priceBasis: 'Per Person', duration: '7 Days', image: 'https://images.unsplash.com/photo-1566833943432-dd2363a6f17d?q=80&w=800&auto=format&fit=crop', dates: '2025 Flexible', highlights: ['Dal Lake Shikara', 'Gulmarg Cable Car'] },
  { id: 'dom-11', title: 'KARNATAKA', category: 'Domestic', destination: 'Karnataka', price: '₹18,000', priceBasis: 'Per Person', duration: '5 Days', image: 'https://images.unsplash.com/photo-1600132806308-ed26a42207b7?q=80&w=800&auto=format&fit=crop', dates: '2025 Flexible', highlights: ['Hampi Ruins', 'Coorg Coffee Estates'] },
  { id: 'dom-12', title: 'KASHI-ALLAHABAD', category: 'Domestic', destination: 'UP', price: '₹14,000', priceBasis: 'Per Person', duration: '4 Days', image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=800&auto=format&fit=crop', dates: '2025 Flexible', highlights: ['Triveni Sangam', 'Prayagraj Fort'] },
  { id: 'dom-13', title: 'KERALA', category: 'Domestic', destination: 'Kerala', price: '₹19,500', priceBasis: 'Per Person', duration: '5 Days', image: 'https://images.unsplash.com/photo-1593179241557-bce1eb92e47e?q=80&w=800&auto=format&fit=crop', dates: '2025 Flexible', highlights: ['Backwaters Houseboat', 'Varkala Beach'] },
  { id: 'dom-14', title: 'SUNDERBANS', category: 'Domestic', destination: 'West Bengal', price: '₹11,000', priceBasis: 'Per Person', duration: '3 Days', image: 'https://images.unsplash.com/photo-1614713745265-1d02d06981cf?q=80&w=800&auto=format&fit=crop', dates: '2025 Flexible', highlights: ['Bengal Tiger Safari', 'Mangrove Forest Boat Trip'] },
  { id: 'dom-15', title: 'GOA', category: 'Domestic', destination: 'Goa', price: '₹15,000', priceBasis: 'Per Person', duration: '4 Days', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop', dates: '2025 Flexible', highlights: ['North Goa Beaches', 'South Goa Heritage'] },
  { id: 'dom-16', title: 'ANDAMAN', category: 'Domestic', destination: 'Andaman', price: '₹38,000', priceBasis: 'Per Person', duration: '6 Days', image: 'https://images.unsplash.com/photo-1589136142558-9dec69575883?q=80&w=800&auto=format&fit=crop', dates: '2025 Flexible', highlights: ['Radhanagar Beach', 'Cellular Jail'] },
  { id: 'dom-17', title: 'GANGTOK - DARJEELING', category: 'Domestic', destination: 'Sikkim/WB', price: '₹24,000', priceBasis: 'Per Person', duration: '7 Days', image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800&auto=format&fit=crop', dates: '2025 Flexible', highlights: ['Tiger Hill Sunrise', 'Tsomgo Lake'] },
  { id: 'dom-18', title: 'VARANASI', category: 'Domestic', destination: 'UP', price: '₹9,000', priceBasis: 'Per Person', duration: '2 Days', image: 'https://images.unsplash.com/photo-1590050752117-23a9d7fc9ba3?q=80&w=800&auto=format&fit=crop', dates: '2025 Flexible', highlights: ['Assi Ghat Aarti', 'Old City Walk'] },
  { id: 'dom-19', title: 'MUKTINATH YATRA', category: 'Domestic', destination: 'Nepal Border', price: '₹45,000', priceBasis: 'Per Person', duration: '8 Days', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop', dates: '2025 Flexible', highlights: ['Muktinath Temple Darshan', 'Pokhara Sightseeing'] },

];

import TourDetails from './components/TourDetails';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [currentView, setCurrentView] = useState<ViewType>('HOME');
  const [user, setUser] = useState<User | null>(null);
  const [signatureTours, setSignatureTours] = useState<TourPackage[]>([]);
  const [selectedTour, setSelectedTour] = useState<TourPackage | null>(null);
  const [isToursLoading, setIsToursLoading] = useState(true);

  const handleTourSelect = (tour: TourPackage) => {
    setSelectedTour(tour);
    setCurrentView('TOUR_DETAILS');
    window.scrollTo(0, 0);
  };

  const contactPhone = "7036665588";
  const contactEmails = ["info@tripfux.com", "info@mripl.com"];

  // Defined handleAuthSuccess to update the user state and fix the reference error
  const handleAuthSuccess = (user: User) => {
    setUser(user);
  };

  useEffect(() => {
    const loadTours = async () => {
      try {
        const dbTours = await dbService.getSignatureTours();
        // Merge DB tours with default tours. 
        // We prioritize DEFAULT_TOURS so that code updates (like itineraries) are immediately visible.
        const combined = [...dbTours];
        DEFAULT_TOURS.forEach(defTour => {
          const index = combined.findIndex(t => t.id === defTour.id);
          if (index !== -1) {
            combined[index] = defTour; // Prioritize the hardcoded "Clone" data
          } else {
            combined.push(defTour);
          }
        });
        setSignatureTours(combined);
      } catch (err) {
        setSignatureTours(DEFAULT_TOURS);
      } finally {
        setIsToursLoading(false);
      }
    };
    loadTours();
  }, []);

  const getToursByCategory = (category: string) => {
    return signatureTours.filter(t => t.category === category);
  };

  const renderHome = () => (
    <div className="animate-in fade-in duration-500">
      {/* Temple Specials */}
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black text-[#0c2d3a] uppercase tracking-tighter">Temple Specials</h2>
          <div className="h-0.5 w-16 bg-[#0c2d3a] mx-auto mt-2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {getToursByCategory('Pilgrimage').slice(0, 3).map(tour => <TourCard key={tour.id} tour={tour} onSelect={handleTourSelect} />)}
        </div>
        <div className="mt-8 text-center">
          <button onClick={() => setCurrentView('PILGRIMAGE')} className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline">View more »</button>
        </div>
      </section>

      {/* International Specials */}
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black text-[#0c2d3a] uppercase tracking-tighter">International Specials</h2>
          <div className="h-0.5 w-16 bg-[#0c2d3a] mx-auto mt-2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {getToursByCategory('International').slice(0, 3).map(tour => <TourCard key={tour.id} tour={tour} onSelect={handleTourSelect} />)}
        </div>
        <div className="mt-8 text-center">
          <button onClick={() => setCurrentView('INTERNATIONAL')} className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline">View more »</button>
        </div>
      </section>

      {/* Domestic Specials */}
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black text-[#0c2d3a] uppercase tracking-tighter">Domestic Specials</h2>
          <div className="h-0.5 w-16 bg-[#0c2d3a] mx-auto mt-2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {getToursByCategory('Domestic').slice(0, 3).map(tour => <TourCard key={tour.id} tour={tour} onSelect={handleTourSelect} />)}
        </div>
        <div className="mt-8 text-center">
          <button onClick={() => setCurrentView('DOMESTIC')} className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline">View more »</button>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-black text-[#0c2d3a] uppercase tracking-tighter">Customer Reviews</h2>
          <div className="h-0.5 w-16 bg-[#0c2d3a] mx-auto mt-2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {[
            { name: "Swarna Rani", text: "We had the most remarkable tour with TripFlux. Everything was just perfect. Every moment was taken care of." },
            { name: "DVS KIRAN", text: "My parents used TripFlux recently. The experience was well organized. Highly recommend for seniors." },
            { name: "KC Rajanna", text: "Traveled 4 times with TripFlux. Char Dham yatra was special. Excellent services and delicious food." }
          ].map((r, i) => (
            <div key={i} className="space-y-3">
              <p className="text-xs text-slate-600 italic leading-relaxed px-4">"{r.text}"</p>
              <div className="mt-4">
                <p className="font-bold text-slate-800 text-sm">{r.name}</p>
                <p className="text-indigo-600 text-[10px] font-black">TRIPFLUX CUSTOMER</p>
                <div className="text-amber-400 text-xs mt-1">★★★★★</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const renderCategoryPage = (title: string, tours: TourPackage[]) => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 py-16 px-6 max-w-7xl mx-auto min-h-[60vh]">
      <div className="text-center mb-16 px-4">
        <h2 className="text-4xl font-extrabold text-[#0c2d3a] tracking-tight mb-4">{title}</h2>
        <div className="h-1 w-20 bg-indigo-600 mx-auto rounded-full"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
        {tours.map(tour => <TourCard key={tour.id} tour={tour} onSelect={handleTourSelect} />)}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Top Banner and Header - Hidden on Tour Details for Full Screen effect */}
      {currentView !== 'TOUR_DETAILS' && (
        <>
          <div className="bg-[#0c2d3a] text-white py-1.5 px-6 flex justify-center items-center text-[10px] font-bold border-b border-white/5 space-x-4">
            <span className="opacity-80">== WELCOME TO TRIPFLUX ==</span>
            <span className="opacity-80">CUSTOMER CARE NO : {contactPhone} ==</span>
          </div>

          <Header
            user={user}
            onLogout={() => setUser(null)}
            onSignIn={() => { }}
            onViewChange={(view) => { setCurrentView(view); window.scrollTo(0, 0); }}
            onAdminClick={() => { window.location.hash = 'admin'; setStatus(AppStatus.ADMIN_LOGIN); }}
            currentView={currentView}
          />
        </>
      )}

      {status === AppStatus.ADMIN_LOGIN ? (
        <AdminLogin onSuccess={() => setStatus(AppStatus.ADMIN)} onCancel={() => setStatus(AppStatus.IDLE)} />
      ) : status === AppStatus.ADMIN ? (
        <AdminDashboard onAddTour={async (t) => { await dbService.saveTour(t); setSignatureTours([t, ...signatureTours]); }} onClose={() => { window.location.hash = ''; setStatus(AppStatus.IDLE); }} />
      ) : (
        currentView === 'TOUR_DETAILS' && selectedTour ? (
          <TourDetails tour={selectedTour} onBack={() => setCurrentView('INTERNATIONAL')} />
        ) : (
          <main className="min-h-screen bg-white">
            {currentView === 'HOME' && renderHome()}
            {currentView === 'INTERNATIONAL' && renderCategoryPage('International Special Packages', getToursByCategory('International'))}
            {currentView === 'DOMESTIC' && renderCategoryPage('Domestic Specials Packages', getToursByCategory('Domestic'))}
            {currentView === 'PILGRIMAGE' && renderCategoryPage('Temple Special Packages', getToursByCategory('Pilgrimage'))}
            {currentView === 'ABOUT' && <AboutUs />}
            {currentView === 'CONTACT' && <ContactUs />}

            <footer className="bg-[#0c2d3a] text-white pt-16 pb-12 px-6 border-t border-white/5 mt-12">
              <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                <div>
                  <h4 className="text-[11px] font-extrabold uppercase tracking-widest mb-6 border-b border-white/10 pb-2">About TRIPFLUX</h4>
                  <p className="text-[10px] text-white/50 leading-relaxed font-medium">
                    We are presently offering (group) tours to Pan India / Europe, South East Asia, along with exclusive special tours for ladies, students, senior citizens, and trips to exotic destinations for newlyweds. In addition, we follow a process of continuous research for new products, themes and special travel upgrades in order to provide the best service to our customers.
                  </p>
                </div>
                <div>
                  <h4 className="text-[11px] font-extrabold uppercase tracking-widest mb-6 border-b border-white/10 pb-2">International Packages</h4>
                  <ul className="text-[10px] text-white/50 space-y-2 font-bold cursor-pointer">
                    <li onClick={() => setCurrentView('INTERNATIONAL')}>» EUROPE SPL</li>
                    <li onClick={() => setCurrentView('INTERNATIONAL')}>» Maldives</li>
                    <li onClick={() => setCurrentView('INTERNATIONAL')}>» Singapore & Malaysia</li>
                    <li onClick={() => setCurrentView('INTERNATIONAL')}>» Bangkok - Phuket</li>
                    <li onClick={() => setCurrentView('INTERNATIONAL')}>» Srilanka</li>
                    <li onClick={() => setCurrentView('INTERNATIONAL')}>» Dubai</li>
                    <li onClick={() => setCurrentView('INTERNATIONAL')}>» Bali</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-[11px] font-extrabold uppercase tracking-widest mb-6 border-b border-white/10 pb-2">Domestic Packages</h4>
                  <ul className="text-[10px] text-white/50 space-y-2 font-bold cursor-pointer">
                    <li onClick={() => setCurrentView('DOMESTIC')}>» Kashi</li>
                    <li onClick={() => setCurrentView('DOMESTIC')}>» North India</li>
                    <li onClick={() => setCurrentView('DOMESTIC')}>» Rajasthan</li>
                    <li onClick={() => setCurrentView('DOMESTIC')}>» Chardham</li>
                    <li onClick={() => setCurrentView('DOMESTIC')}>» Gujarat</li>
                    <li onClick={() => setCurrentView('DOMESTIC')}>» Tamilnadu</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-[11px] font-extrabold uppercase tracking-widest mb-6 border-b border-white/10 pb-2">Special Packages</h4>
                  <ul className="text-[10px] text-white/50 space-y-2 font-bold cursor-pointer mb-6">
                    <li>» Kerala Special Package</li>
                    <li>» HoneyMoon Package</li>
                  </ul>
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-[11px] font-extrabold uppercase tracking-widest mb-3">Follow Us</p>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 bg-white/10 rounded flex items-center justify-center hover:bg-indigo-600 transition-colors cursor-pointer">f</div>
                      <div className="w-6 h-6 bg-white/10 rounded flex items-center justify-center hover:bg-indigo-600 transition-colors cursor-pointer">i</div>
                      <div className="w-6 h-6 bg-white/10 rounded flex items-center justify-center hover:bg-indigo-600 transition-colors cursor-pointer">t</div>
                    </div>
                    <p className="mt-6 text-[11px] font-extrabold">CONTACT: {contactPhone}</p>
                  </div>
                </div>
              </div>
              <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/10 flex justify-between items-center">
                <p className="text-[9px] font-extrabold text-white/30 uppercase tracking-[0.2em]">TripFlux copyright 2026 by mdr Retired india pvt ltd</p>
              </div>
            </footer>
          </main>
        )
      )}

      <AuthModal isOpen={false} onClose={() => { }} onAuthSuccess={handleAuthSuccess} />
      <MobileNav onHome={() => setCurrentView('HOME')} onAdminClick={() => { window.location.hash = 'admin'; setStatus(AppStatus.ADMIN_LOGIN); }} />
    </div>
  );
};

export default App;
