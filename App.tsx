
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MobileNav from './components/MobileNav';
import AuthModal from './components/AuthModal';
import AdminDashboard from './components/AdminDashboard';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';
import AdminLogin from './components/AdminLogin';
import AssociateLogin from './components/AssociateLogin';
import TourCard from './components/TourCard';
import { AppStatus, TourPackage, User } from './types';
import { dbService } from './services/dbService';

import SignupPage from './components/SignupPage';


type ViewType = 'HOME' | 'INTERNATIONAL' | 'DOMESTIC' | 'PILGRIMAGE' | 'ABOUT' | 'CONTACT' | 'TOUR_DETAILS' | 'SIGNUP';

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
          { time: 'Morning', activity: 'Flight Home', description: '06.00am Airport drop for Hyderabad flight', image: '/assets/images/flight.jpg' }
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
          { time: 'Morning', activity: 'Airport Drop', description: 'Hotel check-out and flight home', image: '/assets/images/flight.jpg' }
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
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8',
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
          { time: 'Morning', activity: 'Airport Transfer', description: 'Shared speed boat back to Malé Airport', image: '/assets/images/flight.jpg' },
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
    image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1',
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
          { time: 'Full Day', activity: 'Phi Phi Island', description: 'Speedboat tour of Maya Bay and snorkeling', image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 5, title: 'Bangkok City & Dinner Cruise', activities: [
          { time: 'Evening', activity: 'Chao Phraya Dinner Cruise', description: 'Luxury cruise with live music and buffet', image: 'https://images.unsplash.com/photo-1562914316-ea39665bc7f4?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 6, title: 'Temple Tour & Shopping', activities: [
          { time: 'Afternoon', activity: 'Bangkok Temple Tour', description: 'Visit Golden Buddha and Marble Temple', image: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?q=80&w=800&auto=format&fit=crop' }
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
          { time: 'Morning', activity: 'Airport Drop', description: 'Flight back home', image: '/assets/images/flight.jpg' }
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
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop',
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
          { time: 'Morning', activity: 'Plateau Drive', description: 'Through high altitude plains', image: 'https://images.unsplash.com/photo-1518002598382-74d49a623789?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 7, title: 'Arrival Manasarovar', activities: [
          { time: 'Evening', activity: 'First Darshan', description: 'Vision of Kailash', image: 'https://images.unsplash.com/photo-1605634288018-86866b747055?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 8, title: 'Holy Bath & Darchen', activities: [
          { time: 'Morning', activity: 'Sacred Dip', description: 'Pooja at Manasarovar', image: 'https://images.unsplash.com/photo-1550953683-125064e4b2d5?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 9, title: 'YamaDwar & Parikrama', activities: [
          { time: 'Morning', activity: 'YamaDwar Ritual', description: 'Gateway to parikrama', image: 'https://images.unsplash.com/photo-1616858025175-356d25244583?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 10, title: 'Parikrama Day 2', activities: [
          { time: 'Morning', activity: 'Golden View', description: 'Sunrise on Kailash', image: 'https://images.unsplash.com/photo-1550953683-125064e4b2d5?q=80&w=800&auto=format&fit=crop' }
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
          { time: 'Morning', activity: 'Airport Drop', description: 'Flight back home', image: '/assets/images/flight.jpg' }
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
    image: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed',
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
    category: 'Pilgrimage',
    destination: 'Uttarakhand',
    price: '₹35,000',
    priceBasis: 'Per Person',
    duration: '13 Nights - 14 Days',
    image: '/assets/images/CHARDHAM SPECIAL PACKAGE.jpg',
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
          { time: 'Afternoon', activity: 'Departure', description: 'Drop at Airport/Railway Station for return flight', image: '/assets/images/flight.jpg' }
        ]
      }
    ]
  },
  {
    id: 'dom-2',
    title: 'NORTH INDIA SPECIAL PACKAGE',
    category: 'Domestic',
    destination: 'North India',
    price: '₹28,000',
    priceBasis: 'Per Person',
    duration: '12 Nights - 13 Days',
    image: '/assets/images/NORTH INDIA.jpg',
    dates: '2025 Flexible',
    highlights: ['Delhi', 'Amritsar', 'Wagah Border', 'Jammu', 'Dalhousie', 'Khajjiar', 'Dharamshala', 'McLeod Ganj', 'Chamunda Devi', 'Jwalamukhi', 'Chintapurni', 'Naina Devi', 'Chandigarh', 'Kurukshetra'],
    features: ['AC Vehicle road transportation', 'Breakfast – Lunch – Dinner', 'AC Accommodation (Twin Sharing)', 'Daily mineral water bottle'],
    itinerary: [
      {
        day: 1, title: 'Arrival Delhi & Journey to Amritsar', activities: [
          { time: 'Morning', activity: 'Arrival Delhi', description: 'Journey starts from Hyderabad to Delhi by Flight. Arrival at Delhi and proceed to Amritsar by Bus.', image: '/assets/images/flight.jpg' }
        ]
      },
      {
        day: 2, title: 'Amritsar Local & Wagah Border', activities: [
          { time: 'Morning', activity: 'Amritsar Local Tour', description: 'After breakfast visit Golden Temple, Jallianwala Bagh and Durgiana Temple.', image: 'https://images.unsplash.com/photo-1514222139-b57677ce0a84?q=80&w=800&auto=format&fit=crop' },
          { time: 'Evening', activity: 'Wagah Border', description: 'Visit Wagah Border for the retreat ceremony.' }
        ]
      },
      {
        day: 3, title: 'Journey to Katra & Jammu Temple', activities: [
          { time: 'Morning', activity: 'Transfer to Katra', description: 'Breakfast and journey to Katra via Jammu.', image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=800&auto=format&fit=crop' },
          { time: 'Evening', activity: 'Jammu Raghunath Mandir', description: 'Visit the historic Raghunath Mandir in Jammu.' }
        ]
      },
      {
        day: 4, title: 'Vaishno Devi Temple Darshan', activities: [
          { time: 'Full Day', activity: 'Mata Vaishno Devi Visit', description: 'Trek to the holy shrine of Mata Vaishno Devi (12 km Walk, Horse or Doli).', image: 'https://images.unsplash.com/photo-1598460064560-64f33fd1c5b4?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 5, title: 'Journey to Dalhousie', activities: [
          { time: 'Morning', activity: 'Transfer to Dalhousie', description: 'After breakfast, journey starts for Dalhousie.', image: 'https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 6, title: 'Dalhousie & Khajjiar Sightseeing', activities: [
          { time: 'Morning', activity: 'Khajjiar Visit', description: 'Visit Khajjiar (India\'s Mini Switzerland), Panch Pulla, and Satdhara Falls.', image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 7, title: 'Journey to Dharamshala', activities: [
          { time: 'Morning', activity: 'Transfer to Dharamshala', description: 'Scenic drive to Dharamshala. Check-in and leisure walk to nearby places.', image: 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 8, title: 'Dharamshala Local & Chamunda', activities: [
          { time: 'Morning', activity: 'Dharamshala Local', description: 'Visit Dalai Lama Temple, Monastry, Cricket Stadium and Tea Gardens.', image: 'https://images.unsplash.com/photo-1599839619722-397514112634?q=80&w=800&auto=format&fit=crop' },
          { time: 'Evening', activity: 'Chamunda Devi', description: 'Journey to Chamunda and check-in.' }
        ]
      },
      {
        day: 9, title: 'Chamunda, Jwalamukhi & Chintapurni', activities: [
          { time: 'Morning', activity: 'Temple Visits', description: 'Visit Chamunda Devi, Jwalamukhi Temple and proceed to Chintapurni.', image: 'https://images.unsplash.com/photo-1620619767323-af6cf628705e?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 10, title: 'Naina Devi & Chandigarh', activities: [
          { time: 'Morning', activity: 'Naina Devi Temple', description: 'Visit Naina Devi and proceed to Chandigarh.', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 11, title: 'Chandigarh Local & Kurukshetra', activities: [
          { time: 'Morning', activity: 'Chandigarh Sights', description: 'Visit Sukhna Lake, Rock Garden and Rose Garden. Journey to Kurukshetra.', image: 'https://images.unsplash.com/photo-1614713745265-1d02d06981cf?q=80&w=800&auto=format&fit=crop' }
        ]
      },
      {
        day: 12, title: 'Kurukshetra & Akshardham', activities: [
          { time: 'Morning', activity: 'Kurukshetra Tour', description: 'Visit Jyotisar, BanGanga and Brahma Sarovar. Journey to Delhi.', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=800&auto=format&fit=crop' },
          { time: 'Evening', activity: 'Akshardham Temple', description: 'Visit the architectural marvel after reaching Delhi.' }
        ]
      },
      {
        day: 13, title: 'Delhi Local & Departure', activities: [
          { time: 'Morning', activity: 'Delhi City Tour', description: 'Visit India Gate, Parliament House, Raj Ghat and Qutub Minar. Flight back home.', image: 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=800&auto=format&fit=crop' }
        ]
      }
    ]
  },
  {
    id: 'dom-3',
    title: 'NAIMISARANYAM KASHI-GAYA SPECIAL',
    category: 'Pilgrimage',
    destination: 'UP/Bihar',
    price: '₹25,000',
    priceBasis: 'Per Person',
    duration: '11 Nights - 12 Days',
    image: '/assets/images/NAIMISARANYAM KASHI-GAYA.jpg',
    dates: '2025 Flexible',
    highlights: ['Naimisaranyam', 'Kashi Vishwanath', 'Gaya Vishnu Pada', 'Ayodhya Ram Janmabhoomi', 'Prayagraj Sangam', 'Bodhgaya', 'Vindhyachal', 'Sitamarhi'],
    features: ['AC Vehicle road transportation', 'Breakfast – Lunch – Dinner', 'AC Accommodation (Twin Sharing)', 'Daily mineral water bottle'],
    itinerary: [
      {
        day: 1, title: 'Arrival Lucknow & Naimisaranyam', activities: [
          { time: 'Morning', activity: 'Arrival Lucknow', description: 'Journey from Hyderabad to Lucknow by Flight. Arrival and proceed to Naimisharanyam.' },
          { time: 'Afternoon', activity: 'Naimisaranyam Temples', description: 'Check-in and visit the sacred temples of Naimisaranyam.' }
        ]
      },
      {
        day: 2, title: 'Naimisharanyam to Varanasi', activities: [
          { time: 'Morning', activity: 'Swami Vratam', description: 'Participate in Satyanarayana Swami Vratam.' },
          { time: 'Afternoon', activity: 'Transfer to Kashi', description: 'Journey starts towards Varanasi. Arrival and dinner.' }
        ]
      },
      {
        day: 3, title: 'Kashi Local Sightseeing', activities: [
          { time: 'Morning', activity: 'Temple Visits', description: 'Visit Kal Bhairav Temple, Sarnath and Vyasa Kashi.' },
          { time: 'Afternoon', activity: 'Varanasi Temples', description: 'Visit Birla Mandir, Sankatmochan Hanuman, Tulsi Manas and Durga Mandir.' }
        ]
      },
      {
        day: 4, title: 'Prayagraj (Allahabad) Visit', activities: [
          { time: 'Morning', activity: 'Triveni Sangam', description: 'Early morning journey for Holy bath at Triveni Sangam and sacred rituals.' },
          { time: 'Afternoon', activity: 'Anand Bhawan', description: 'Visit Bada Hanuman Mandir, Anand Bhawan and Madhaveshwari Temple. Return to Kashi.' }
        ]
      },
      {
        day: 5, title: 'Kashi Vishwanath Darshan', activities: [
          { time: 'Morning', activity: 'Vishwanath Darshan', description: 'Main Darshan at Kashi Vishwanath Temple and leisure time in the holy city.' }
        ]
      },
      {
        day: 6, title: 'Ayodhya Day Trip', activities: [
          { time: 'Morning', activity: 'Ayodhya Visit', description: 'Journey to Ayodhya. Visit Sri Ram Janmabhoomi, Sarayu River and Hanuman Garhi.' },
          { time: 'Evening', activity: 'Return to Kashi', description: 'Travel back to Varanasi for overnight stay.' }
        ]
      },
      {
        day: 7, title: 'Vindhyachal & Sitamarhi', activities: [
          { time: 'Morning', activity: 'Vindhyachal', description: 'Visit Vindhyavahini Temple.' },
          { time: 'Afternoon', activity: 'Sitamarhi', description: 'Visit Sitamarhi Temple and return to Varanasi.' }
        ]
      },
      {
        day: 8, title: 'Sacred Rituals & Ganga Aarti', activities: [
          { time: 'Morning', activity: 'Manikarnika Ghat', description: 'Death ceremony poojas and holy bath at Manikarnika Ghat.' },
          { time: 'Evening', activity: 'Ganga Harathi', description: 'Boat ride visiting 64 ghats and witness the grand Ganga Aarti.' }
        ]
      },
      {
        day: 9, title: 'Kashi Inner Tour', activities: [
          { time: 'Morning', activity: 'Abhishekham', description: 'Early morning Abhishekham at Vishwanath Temple.' },
          { time: 'Afternoon', activity: 'Ghat Exploration', description: 'Visit Lalitha Ghat, Kedar Ghat and Sankata Devi Temple.' }
        ]
      },
      {
        day: 10, title: 'Leisure & Sapta Rishi Aarti', activities: [
          { time: 'Morning', activity: 'Shopping', description: 'Free time for exploring Varanasi markets.' },
          { time: 'Evening', activity: 'Sapta Rishi Harathi', description: 'Witness the divine Sapta Rishi Harathi at Vishwanath Temple.' }
        ]
      },
      {
        day: 11, title: 'Gaya & Bodh Gaya', activities: [
          { time: 'Morning', activity: 'Gaya Rituals', description: 'Visit Vishnu Pada Mandir for Pinda Pradhan (Death Ceremony Poojas) and Mangala Gowri Temple.' },
          { time: 'Evening', activity: 'Bodh Gaya', description: 'Visit the Main Bodh Gaya Temple (Mahabodhi Temple).' }
        ]
      },
      {
        day: 12, title: 'Departure from Patna', activities: [
          { time: 'Morning', activity: 'Transfer to Patna', description: 'Breakfast and journey to Patna Airport.' },
          { time: 'Afternoon', activity: 'Flight Home', description: 'Return journey to Hyderabad by flight.' }
        ]
      }
    ]
  },
  {
    id: 'dom-4',
    title: 'MUKTHINATH SPECIAL PACKAGE',
    category: 'Pilgrimage',
    destination: 'Nepal / UP / Bihar',
    price: '₹55,000',
    priceBasis: 'Per Person',
    duration: '12 Nights - 13 Days',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa',
    dates: '2025 Flexible',
    highlights: ['Janakpur Janaki Mandir', 'Pokhara Sightseeing', 'Mukthinath Temple', 'Manakamana Devi', 'Kathmandu Pashupathinath', 'Lumbini Maya Devi', 'Naimisaranyam Darshan', 'Varanasi Ganga Aarti'],
    features: ['Deluxe AC Accommodation', 'AC vehicle for road transportation', 'Breakfast – Lunch – Dinner', 'Hyderabad – Patna Flight Included', 'Pokhara – Jomsom Charter Flight', 'Varanasi – Hyderabad Flight Included'],
    itinerary: [
      {
        day: 1, title: 'Arrival Patna', activities: [
          { time: 'Morning', activity: 'Flight to Patna', description: 'Journey starts from Hyderabad to Patna by Flight. Arrival and hotel check-in.' }
        ]
      },
      {
        day: 2, title: 'Journey to Janakpur', activities: [
          { time: 'Morning', activity: 'Transfer to Janakpur', description: 'Travel to Janakpur, Nepal.' },
          { time: 'Afternoon', activity: 'Janakpur Sightseeing', description: 'Visit Janaki Mandir, Ram Sita Vivah Mandap, and Ganga Sagar.' }
        ]
      },
      {
        day: 3, title: 'Journey to Pokhara', activities: [
          { time: 'All Day', activity: 'Transfer to Pokhara', description: 'Scenic drive to the lake city of Pokhara.' }
        ]
      },
      {
        day: 4, title: 'Fly to Jomsom & Mukthinath', activities: [
          { time: 'Morning', activity: 'Flight to Jomsom', description: 'Charter flight to Jomsom. Transfer to Mukthinath by local bus.' },
          { time: 'Afternoon', activity: 'Mukthinath Temple', description: 'Darshan at the sacred Mukthinath Temple. Return to Jomsom.' }
        ]
      },
      {
        day: 5, title: 'Pokhara Local Tour', activities: [
          { time: 'Morning', activity: 'Flight to Pokhara', description: 'Return flight to Pokhara.' },
          { time: 'Afternoon', activity: 'Local Sightseeing', description: 'Visit Brindvasini Temple, Devis Falls, Guptheshwar Mahadev, and Varahi Temple.' }
        ]
      },
      {
        day: 6, title: 'Leisure Day in Pokhara', activities: [
          { time: 'Full Day', activity: 'Buffer Day', description: 'Rest or optional activities (for flight delays/contingency).' }
        ]
      },
      {
        day: 7, title: 'Manakamana Devi & Kathmandu', activities: [
          { time: 'Morning', activity: 'Manakamana Devi', description: 'Visit the goddess temple by Ropeway.' },
          { time: 'Evening', activity: 'Transfer to Kathmandu', description: 'Journey to the capital city. Check-in and dinner.' }
        ]
      },
      {
        day: 8, title: 'Kathmandu Spiritual Tour', activities: [
          { time: 'Morning', activity: 'Pashupathinath Temple', description: 'Visit the holiest Hindu temple in Nepal.' },
          { time: 'Afternoon', activity: 'Temple Visits', description: 'Visit Buda Neelakanta, Swayambhunath temple, and Gruheswari Matha Mandir.' }
        ]
      },
      {
        day: 9, title: 'Journey to Sonauli', activities: [
          { time: 'All Day', activity: 'Transfer to Sonauli', description: 'Journey back towards the Indian border.' }
        ]
      },
      {
        day: 10, title: 'Lumbini & Naimisaranyam', activities: [
          { time: 'Morning', activity: 'Lumbini Visit', description: 'Visit Maya Devi Temple (Birthplace of Buddha).' },
          { time: 'Evening', activity: 'Transfer to Naimisharanyam', description: 'Long journey to the sacred forest destination.' }
        ]
      },
      {
        day: 11, title: 'Naimisharanyam & Varanasi', activities: [
          { time: 'Morning', activity: 'Temple Visits', description: 'Visit Chakra Tirtha and other temples in Naimisharanyam.' },
          { time: 'Evening', activity: 'Transfer to Varanasi', description: 'Proceed to Kashi for overnight stay.' }
        ]
      },
      {
        day: 12, title: 'Kashi Darshan & Ganga Aarti', activities: [
          { time: 'Morning', activity: 'City of Light', description: 'Visit Kal Bhairav, Kashi Viswanath, Annapurna Devi, and Vishalakshi Temple.' },
          { time: 'Evening', activity: 'Ganga Harathi', description: 'Boat ride visiting 64 ghats and witness the grand evening aarti.' }
        ]
      },
      {
        day: 13, title: 'Departure from Varanasi', activities: [
          { time: 'Morning', activity: 'Final Darshan', description: 'Visit Kashi Viswanath Temple again or free time for shopping.' },
          { time: 'Afternoon', activity: 'Departure', description: 'Transfer to Varanasi Airport for flight to Hyderabad.' }
        ]
      }
    ]
  },
  {
    id: 'dom-5',
    title: 'RAJASTHAN SPECIAL PACKAGE',
    category: 'Domestic',
    destination: 'Rajasthan',
    price: '₹32,000',
    priceBasis: 'Per Person',
    duration: '10 Nights - 11 Days',
    image: '/assets/images/RAJASTHAN.jpg',
    dates: '2025 Flexible',
    highlights: ['Amber Fort', 'Deshnok Karni Mata', 'Jaisalmer Fort', 'Sam Sand Dunes Safari', 'Jodhpur Mehrangarh', 'Mount Abu', 'Udaipur City Palace', 'Nathdwara Temple', 'Pushkar'],
    features: ['AC Vehicle road transportation', 'Breakfast – Lunch – Dinner', 'AC Accommodation', 'Daily one mineral water bottle'],
    itinerary: [
      {
        day: 1, title: 'Arrival Jaipur & Amber Fort', activities: [
          { time: 'Morning', activity: 'Arrival Jaipur', description: 'Journey starts from Hyderabad to Jaipur by Flight. Arrival and proceed to Hotel.' },
          { time: 'Afternoon', activity: 'Amber Fort', description: 'After lunch, visit Amber Fort and Jalmahal.' }
        ]
      },
      {
        day: 2, title: 'Jaipur to Bikaner via Deshnok', activities: [
          { time: 'Morning', activity: 'Journey to Deshnok', description: 'Check out and travel to Deshnok to visit the Karni Mata Temple.' },
          { time: 'Evening', activity: 'Bikaner Arrival', description: 'Proceed to Bikaner for check-in and overnight stay.' }
        ]
      },
      {
        day: 3, title: 'Bikaner Sightseeing & Jaisalmer', activities: [
          { time: 'Morning', activity: 'Bikaner Local', description: 'Visit Junagarh Fort, Laxmi Vilas Palace and Camel Breeding Centre.' },
          { time: 'Afternoon', activity: 'Journey to Jaisalmer', description: 'Transfer to the Golden City. Arrival and check-in.' }
        ]
      },
      {
        day: 4, title: 'Jaisalmer Local & Desert Stay', activities: [
          { time: 'Morning', activity: 'Jaisalmer City', description: 'Explore Gadi Sagar Lake, Havelis (Salim Singh, Patwon), Bada Bagh and Jaisalmer Fort.' },
          { time: 'Evening', activity: 'Sam Sand Dunes', description: 'Journey to Sam for desert safari and cultural overnight stay.' }
        ]
      },
      {
        day: 5, title: 'Jaisalmer to Jodhpur', activities: [
          { time: 'Morning', activity: 'Transfer to Jodhpur', description: 'Journey to the Blue City.' },
          { time: 'Afternoon', activity: 'Umaid Bhavan', description: 'Visit the magnificent Umaid Bhavan Palace. Free time for shopping.' }
        ]
      },
      {
        day: 6, title: 'Jodhpur Sights & Mount Abu', activities: [
          { time: 'Morning', activity: 'Fort & Royal Cenotaphs', description: 'Visit Mehrangarh Fort and Jaswant Thada.' },
          { time: 'Afternoon', activity: 'Mount Abu Journey', description: 'Drive to the only hill station of Rajasthan. Arrival and rest.' }
        ]
      },
      {
        day: 7, title: 'Mount Abu to Udaipur', activities: [
          { time: 'Morning', activity: 'Mount Abu Local', description: 'Visit Nakki Lake, Om Shanti Bhavan, Adhar Devi Temple and Dilwara Jain Temple.' },
          { time: 'Afternoon', activity: 'Proceed to Udaipur', description: 'Journey to the City of Lakes. Arrival and overnight stay.' }
        ]
      },
      {
        day: 8, title: 'Udaipur Full Day Sightseeing', activities: [
          { time: 'Full Day', activity: 'City Tour', description: 'Visit City Palace, Jagdish Mandir, Maharana Pratap Smarak, Fateh Sagar Lake, and Saheliyon-ki-Bari.' }
        ]
      },
      {
        day: 9, title: 'Udaipur to Nathdwara', activities: [
          { time: 'Morning', activity: 'Udaipur Leisure', description: 'Final exploration of Udaipur then proceed to Nathdwara.' },
          { time: 'Evening', activity: 'Temple Visit', description: 'Darshan at Shrinathji Temple (Nathdwara).' }
        ]
      },
      {
        day: 10, title: 'Kankroli Dwarka & Pushkar', activities: [
          { time: 'Morning', activity: 'Kankroli Dwarka', description: 'Visit Dwarkadhish Temple at Kankroli and proceed to Pushkar.' },
          { time: 'Evening', activity: 'Pushkar Stay', description: 'Arrival Pushkar, check-in and rest.' }
        ]
      },
      {
        day: 11, title: 'Jaipur Local & Departure', activities: [
          { time: 'Morning', activity: 'Pink City Sights', description: 'Visit City Palace, Jantar Mantar, Hawa Mahal and Birla Mandir in Jaipur.' },
          { time: 'Evening', activity: 'Flight Home', description: 'Transfer to Jaipur Airport for return flight to Hyderabad.' }
        ]
      }
    ]
  },
  {
    id: 'dom-6',
    title: 'KASHI SPECIAL PACKAGE',
    category: 'Pilgrimage',
    destination: 'Varanasi',
    price: '₹22,500',
    priceBasis: 'Per Person',
    duration: '9 Nights - 10 Days',
    image: '/assets/images/KASHI SPECIAL PACKAGE.jpg',
    dates: '2025 Flexible',
    highlights: ['Kashi Vishwanath Main Temple', 'Gaya & Bodh Gaya', 'Ayodhya Ram Janmabhoomi', 'Prayagraj Sangam', 'Sarnath & Vyasa Kashi', 'Ganga Harathi & 64 Ghats', 'Vindhyachal & Sitamarhi'],
    features: ['AC Vehicle road transportation', 'Breakfast – Lunch – Dinner', 'AC Accommodation', 'Daily one mineral water bottle'],
    itinerary: [
      {
        day: 1, title: 'Arrival Varanasi', activities: [
          { time: 'Morning', activity: 'Arrival Kashi', description: 'Journey starts from Hyderabad to Varanasi by Flight. Arrival and proceed to Hotel.' },
          { time: 'Evening', activity: 'Leisure', description: 'Check-in and rest at hotel in Kashi.' }
        ]
      },
      {
        day: 2, title: 'Kashi Local Sightseeing', activities: [
          { time: 'Morning', activity: 'Ancient Temples', description: 'Visit Kal Bhairav Temple, Sarnath and Vyasa Kashi.' },
          { time: 'Afternoon', activity: 'City Tour', description: 'Visit Birla Mandir, Sankatmochan Hanuman, Tulsi Manas, Durga Mandir and Gavallama temple.' }
        ]
      },
      {
        day: 3, title: 'Prayagraj (Allahabad) Visit', activities: [
          { time: 'Morning', activity: 'Triveni Sangam', description: 'Holy bath at Sangam and visit Bada Hanuman Temple.' },
          { time: 'Afternoon', activity: 'Anandbhawan', description: 'Visit Anandbhawan and Madhaveshwari Temple. Return to Kashi.' }
        ]
      },
      {
        day: 4, title: 'Vindhyachal & Sitamarhi', activities: [
          { time: 'Morning', activity: 'Vindhyachal', description: 'Visit Vindhyavahini temple.' },
          { time: 'Afternoon', activity: 'Sitamarhi', description: 'Visit Sitamarhi Temple and return to Varanasi.' }
        ]
      },
      {
        day: 5, title: 'Kashi Vishwanath Darshan', activities: [
          { time: 'Morning', activity: 'Main Temple', description: 'Holy Darshan at Kashi Vishwanath Temple and leisure time.' }
        ]
      },
      {
        day: 6, title: 'Ayodhya Day Trip', activities: [
          { time: 'Morning', activity: 'Ram Janmabhoomi', description: 'Visit Sri Ram Janmabhoomi, Sarayu river, and Hanuman Mandir.' },
          { time: 'Evening', activity: 'Return to Kashi', description: 'Return journey for overnight stay in Kashi.' }
        ]
      },
      {
        day: 7, title: 'Manikarnika Ghat & Ganga Aarti', activities: [
          { time: 'Morning', activity: 'Sacred Rituals', description: 'Holy bath at Manikarnika Ghat.' },
          { time: 'Evening', activity: 'Ganga Harathi', description: 'Boat ride visiting 64 Ghats and witness the grand Ganga Harathi.' }
        ]
      },
      {
        day: 8, title: 'Gaya & Bodh Gaya', activities: [
          { time: 'Morning', activity: 'Vishnu Pada', description: 'Journey to Gaya. Visit Vishnu Pada Mandir and Mangala Gowri Temple.' },
          { time: 'Afternoon', activity: 'Mahabodhi Temple', description: 'Visit Bodh Gaya main temple and return to Varanasi.' }
        ]
      },
      {
        day: 9, title: 'Sapta Rishi Harathi', activities: [
          { time: 'Morning', activity: 'City Exploration', description: 'Visit Annapurna Devi, Vishalakshi and Varahi temple.' },
          { time: 'Evening', activity: 'Divine Harathi', description: 'Witness the divine Sapta Rishi Harathi at the main temple.' }
        ]
      },
      {
        day: 10, title: 'Final Darshan & Departure', activities: [
          { time: 'Morning', activity: 'Temple Visit', description: 'Holy bath and final Darshan at Kashi Vishwanath and Annapurna temples.' },
          { time: 'Evening', activity: 'Departure', description: 'Transfer to Varanasi Airport for flight back to Hyderabad.' }
        ]
      }
    ]
  },
  {
    id: 'dom-7',
    title: 'DODHAM SPECIAL PACKAGE',
    category: 'Pilgrimage',
    destination: 'Uttarakhand',
    price: '₹26,000',
    priceBasis: 'Per Person',
    duration: '8 Nights - 9 Days',
    image: '/assets/images/DODHAM SPECIAL PACKAGE.jpg',
    dates: '2025 Flexible',
    highlights: ['Kedarnath Temple', 'Badrinath Temple', 'Haridwar Ganga Aarti', 'Rishikesh Ram Jhula', 'Akshardham Temple', 'Brahmakapalam'],
    features: ['AC Vehicle for road transportation', 'Breakfast – Lunch – Dinner', 'AC Accommodation (Delhi & Haridwar)', 'Daily Mineral Water bottle'],
    itinerary: [
      {
        day: 1, title: 'Arrival Delhi & Akshardham', activities: [
          { time: 'Morning', activity: 'Arrival', description: 'Pickup from Delhi Airport / Railway station and check-in.' },
          { time: 'Afternoon', activity: 'Akshardham', description: 'Visit the magnificent Akshardham temple.' }
        ]
      },
      {
        day: 2, title: 'Journey to Haridwar', activities: [
          { time: 'Morning', activity: 'Transfer', description: 'Early morning journey to Haridwar.' },
          { time: 'Afternoon', activity: 'Sightseeing', description: 'Visit Manasa Devi Temple and experience the holy Ganga Harathi.' }
        ]
      },
      {
        day: 3, title: 'Journey to Rampur', activities: [
          { time: 'Morning', activity: 'Transfer', description: 'Drive towards Rampur through scenic mountain routes.' }
        ]
      },
      {
        day: 4, title: 'Kedarnath Darshan', activities: [
          { time: 'Full Day', activity: 'Kedarnath Temple', description: 'Full day dedicated to the holy visit of Kedarnath temple.' }
        ]
      },
      {
        day: 5, title: 'Buffer/Optional Day', activities: [
          { time: 'Full Day', activity: 'Rest/Darshan', description: 'Reserved for Kedarnath temple darshan or travel contingency.' }
        ]
      },
      {
        day: 6, title: 'Journey to Pipalkot', activities: [
          { time: 'Morning', activity: 'Transfer', description: 'Journey starts towards Pipalkot.' }
        ]
      },
      {
        day: 7, title: 'Badrinath Darshan', activities: [
          { time: 'Morning', activity: 'Badrinath Temple', description: 'Visit Badrinath temple and perform rituals at Brahmakapalam.' },
          { time: 'Afternoon', activity: 'Return to Pipalkot', description: 'Journey back to Pipalkot for overnight stay.' }
        ]
      },
      {
        day: 8, title: 'Rishikesh & Journey to Delhi', activities: [
          { time: 'Morning', activity: 'Transfer', description: 'Travel to Rishikesh.' },
          { time: 'Afternoon', activity: 'Sightseeing', description: 'Visit Ram Jhula and Laxman Jhula. Proceed to Haridwar and then to Delhi.' }
        ]
      },
      {
        day: 9, title: 'Delhi Local & Departure', activities: [
          { time: 'Morning', activity: 'City Tour', description: 'Visit Birla Mandir, Rajghat, India Gate, and see Parliament House & Rashtrapati Bhavan.' },
          { time: 'Afternoon', activity: 'Departure', description: 'Drop at Airport / Railway station for return journey.' }
        ]
      }
    ]
  },
  {
    id: 'dom-8',
    title: 'TAMIL NADU SPECIAL PACKAGE',
    category: 'Pilgrimage',
    destination: 'Tamil Nadu',
    price: '₹22,000',
    priceBasis: 'Per Person',
    duration: '7 Nights - 8 Days',
    image: '/assets/images/TAMIL NADU.jpg',
    dates: '2025 Flexible',
    highlights: ['Madurai Meenakshi Temple', 'Rameswaram Spatika Lingam', 'Kanyakumari Sunrise & Vivekananda Rock', 'Tiruvannamalai Arunachaleswarar', 'Chidambaram Natarajar', 'Tanjavur Brihadisvara', 'Srirangam Ranganathaswamy', 'Kanchipuram Kamakshi'],
    features: ['AC Vehicle road transportation', 'Breakfast – Lunch – Dinner', 'Deluxe Accommodation', 'Daily one mineral water bottle'],
    itinerary: [
      {
        day: 1, title: 'Departure from Hyderabad', activities: [
          { time: 'Evening', activity: 'Journey Begins', description: 'Journey starts from Hyderabad to Kanipakam by Bus. Overnight journey.' }
        ]
      },
      {
        day: 2, title: 'Kanipakam, Sripuram & Tiruvannamalai', activities: [
          { time: 'Morning', activity: 'Temple Visits', description: 'Visit Kanipakam Temple and proceed to Sripuram Golden Temple.' },
          { time: 'Evening', activity: 'Transfer', description: 'Arrive at Tiruvannamalai for check-in and dinner.' }
        ]
      },
      {
        day: 3, title: 'Arunachalam to Kumbakonam', activities: [
          { time: 'Morning', activity: 'Spiritual Visits', description: 'Visit Tiruvannamalai Temple and Ramana Maharshi Ashram. Proceed to Chidambaram.' },
          { time: 'Evening', activity: 'Natarajar Darshan', description: 'Visit Chidambaram Natarajar Temple and proceed to Kumbakonam for overnight stay.' }
        ]
      },
      {
        day: 4, title: 'Kumbakonam & Srirangam', activities: [
          { time: 'Morning', activity: 'Temple Visits', description: 'Visit Kumbakonam Temple and proceed to Srirangam.' },
          { time: 'Afternoon', activity: 'Divya Desam', description: 'Visit Srirangam Ranganathaswamy Temple and Jambukeswaram Temple.' }
        ]
      },
      {
        day: 5, title: 'Tanjavur to Rameswaram', activities: [
          { time: 'Morning', activity: 'Big Temple Visit', description: 'Visit Tanjavur Brihadisvara Temple and proceed to Rameswaram.' },
          { time: 'Evening', activity: 'Transfer', description: 'Arrival at Rameswaram for check-in and rest.' }
        ]
      },
      {
        day: 6, title: 'Rameswaram, Tiruchendur & Kanyakumari', activities: [
          { time: 'Early Morning', activity: 'Sacred Rituals', description: 'Spatikalinga Darshanam, Holy bath in ocean and 22 wells bath.' },
          { time: 'Afternoon', activity: 'Sea Shore Temple', description: 'Visit Tiruchendur Murugan Temple and proceed to Kanyakumari.' }
        ]
      },
      {
        day: 7, title: 'Kanyakumari & Madurai', activities: [
          { time: 'Early Morning', activity: 'Sunrise View', description: 'Experience the beautiful sunrise at the confluence of three oceans.' },
          { time: 'Morning', activity: 'Rock Memorial', description: 'Visit Kanyakumari Amman Temple and Vivekananda Rock Memorial by ferry.' },
          { time: 'Evening', activity: 'Meenakshi Darshan', description: 'Visit the world-famous Madurai Meenakshi Temple.' }
        ]
      },
      {
        day: 8, title: 'Palani, Coimbatore & Kanchipuram', activities: [
          { time: 'Morning', activity: 'Hill Temple', description: 'Visit Palani Murugan Temple and proceed to Coimbatore.' },
          { time: 'Afternoon', activity: 'Dyanalingam', description: 'Visit Isha Dyanalingam Temple and proceed to Kanchipuram.' },
          { time: 'Late Night', activity: 'Final Darshan', description: 'Visit Kanchi Kamakshi Temple, Kanchi temples and return journey to Hyderabad.' }
        ]
      }
    ]
  },
  {
    id: 'dom-9',
    title: 'SHIMLA-MANALI SPECIAL PACKAGE',
    category: 'Domestic',
    destination: 'Himachal Pradesh',
    price: '₹32,500',
    priceBasis: 'Per Person',
    duration: '6 Nights - 7 Days',
    image: '/assets/images/SHIMLA-MANALI.jpg',
    dates: '2025 Flexible',
    highlights: ['Shimla Mall Road', 'Kufri View Point', 'Manali Ice Point', 'Rohtang Pass (Optional)', 'Kullu River Rafting', 'Chandigarh Rock Garden', 'Kurukshetra Brahma Sarovar', 'Delhi Local Sightseeing'],
    features: ['Luxury Accommodation', 'AC Vehicle for road transportation', 'Breakfast – Lunch – Dinner', 'Daily Mineral water Bottle', 'Toll Gate & Parking Included'],
    itinerary: [
      {
        day: 1, title: 'Arrival Delhi & Kurukshetra', activities: [
          { time: 'Morning', activity: 'Arrival Delhi', description: 'Journey starts from Hyderabad to Delhi by Flight. Arrival and proceed to Kurukshetra.' },
          { time: 'Afternoon', activity: 'Kurukshetra Local', description: 'Visit Brahma Sarovar, Jyotisar, Bang Ganga, and Kali Matha Temple.' }
        ]
      },
      {
        day: 2, title: 'Journey to Shimla', activities: [
          { time: 'Morning', activity: 'Transfer to Hills', description: 'Breakfast and journey to the queen of hills, Shimla.' },
          { time: 'Evening', activity: 'Arrival Shimla', description: 'Check-in at hotel and rest for the night.' }
        ]
      },
      {
        day: 3, title: 'Kufri Visit & Journey to Manali', activities: [
          { time: 'Morning', activity: 'Kufri Sightseeing', description: 'Visit Kufri View Point by horse and enjoy the panoramic mountain views.' },
          { time: 'Afternoon', activity: 'Journey to Manali', description: 'Proceed towards the scenic valley of Manali.' }
        ]
      },
      {
        day: 4, title: 'Manali Local & Ice Point', activities: [
          { time: 'Full Day', activity: 'Ice Point & Temples', description: 'Visit Ice point (Solang Valley/Gulaba), Hadimba Devi Temple, and Vashisht Temple.' },
          { time: 'Evening', activity: 'Mall Road', description: 'Free time for shopping and exploring the famous Mall Road.' }
        ]
      },
      {
        day: 5, title: 'Kullu Rafting & Chandigarh', activities: [
          { time: 'Morning', activity: 'River Rafting', description: 'Experience thrilling River Rafting at Kullu (subject to availability).' },
          { time: 'Afternoon', activity: 'Transfer to Chandigarh', description: 'Journey to the well-planned city of Chandigarh.' }
        ]
      },
      {
        day: 6, title: 'Chandigarh Sights & Delhi', activities: [
          { time: 'Morning', activity: 'Chandigarh Local', description: 'Visit Rock Garden, Rose Garden, and Sukhna Lake.' },
          { time: 'Afternoon', activity: 'Return to Delhi', description: 'Journey back to the capital city. Check-in and dinner.' }
        ]
      },
      {
        day: 7, title: 'Delhi Sightseeing & Departure', activities: [
          { time: 'Morning', activity: 'Delhi City Tour', description: 'Visit Birla Mandir, Parliament House, Rashtrapati Bhavan, India Gate, Rajghat, and Indira Gandhi Museum.' },
          { time: 'Afternoon', activity: 'Departure', description: 'Transfer to Delhi Airport for return flight to Hyderabad.' }
        ]
      }
    ]
  },
  {
    id: 'dom-10',
    title: 'KASHMIR SPECIAL PACKAGE',
    category: 'Domestic',
    destination: 'Kashmir',
    price: '₹34,000',
    priceBasis: 'Per Person',
    duration: '6 Nights - 7 Days',
    image: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d',
    dates: '2025 Flexible',
    highlights: ['Dal Lake Shikara Ride', 'Gulmarg Gandola Phase 1 & 2', 'Pahalgham Sightseeing', 'Sonmarg Glacier', 'Shankaracharya Temple', 'Shalimar & Nishat Gardens'],
    features: ['Deluxe Accommodation', 'Vehicle for road transportation', 'Breakfast – Lunch – Dinner', 'Daily mineral water bottle'],
    itinerary: [
      {
        day: 1, title: 'Arrival Srinagar & Dal Lake', activities: [
          { time: 'Morning', activity: 'Flight to Srinagar', description: 'Journey from Delhi to Srinagar by Flight. Arrival and transfer to House Boat.' },
          { time: 'Evening', activity: 'Shikara Ride', description: 'Enjoy a peaceful Shikara ride on the famous Dal Lake. Overnight stay in House Boat.' }
        ]
      },
      {
        day: 2, title: 'Srinagar Local Sightseeing', activities: [
          { time: 'Morning', activity: 'Garden Tour', description: 'Visit Shankaracharya temple, Shalimar Gardens and Nishatbagh Gardens.' },
          { time: 'Afternoon', activity: 'Temple Visit', description: 'Visit the Saraswathi Devi temple and relax in the beauty of Srinagar.' }
        ]
      },
      {
        day: 3, title: 'Gulmarg Ice Point', activities: [
          { time: 'Morning', activity: 'Gandola Ride', description: 'Journey to Gulmarg. Visit Ice Point Phase 1 and 2 via the Gandola cable car.' },
          { time: 'Afternoon', activity: 'Return to Srinagar', description: 'Return to Srinagar for overnight stay.' }
        ]
      },
      {
        day: 4, title: 'Pahalgham Discovery', activities: [
          { time: 'Morning', activity: 'Transfer to Pahalgham', description: 'Journey to the beautiful valley of Pahalgham.' },
          { time: 'Afternoon', activity: 'Local Exploration', description: 'Explore Pahalgham local sightseeing by local taxi or horse. Overnight stay at Pahalgham.' }
        ]
      },
      {
        day: 5, title: 'Awantipura & Srinagar Shopping', activities: [
          { time: 'Morning', activity: 'Ancient Ruins', description: 'Visit the historic Awantipura Ruins on the way back to Srinagar.' },
          { time: 'Afternoon', activity: 'Shopping at Lal Chowk', description: 'Free time to visit and shop at the famous Lal Chowk market.' }
        ]
      },
      {
        day: 6, title: 'Sonmarg Glacier Trip', activities: [
          { time: 'Morning', activity: 'Glacier Visit', description: 'Journey to Sonmarg. Visit the stunning glacier by walk, horse or local taxi.' },
          { time: 'Afternoon', activity: 'Return to Srinagar', description: 'Return journey to Srinagar for final overnight stay.' }
        ]
      },
      {
        day: 7, title: 'Departure from Srinagar', activities: [
          { time: 'Morning', activity: 'Airport Transfer', description: 'Transfer to Srinagar Airport for flight to Delhi.' },
          { time: 'Afternoon', activity: 'Return Home', description: 'Connected flight from Delhi to Hyderabad.' }
        ]
      }
    ]
  },
  {
    id: 'dom-11',
    title: 'KARNATAKA SPECIAL PACKAGE',
    category: 'Domestic',
    destination: 'Karnataka',
    price: '₹24,500',
    priceBasis: 'Per Person',
    duration: '6 Nights - 7 Days',
    image: '/assets/images/KARNATAKA SPECIAL PACKAGE.jpg',
    dates: '2025 Flexible',
    highlights: ['Bangalore Local', 'Mysore Maharaja Palace', 'Halebidu & Belur', 'Kukke Subramanya', 'Dharmasthala', 'Murudeshwar Temple & Beach', 'Gokarna', 'Hampi Ruins'],
    features: ['Deluxe AC Accommodation', 'AC Vehicle for road transportation', 'Breakfast – Lunch – Dinner', 'Toll Gate, Parking & Driver Beta Included', 'Daily one mineral water bottle'],
    itinerary: [
      {
        day: 1, title: 'Arrival & Bangalore Sightseeing', activities: [
          { time: 'Morning', activity: 'Arrival Bangalore', description: 'Arrival at Bangalore and check-in to hotel.' },
          { time: 'Afternoon', activity: 'Bangalore Local', description: 'Visit local sightseeing spots and free time for shopping.' }
        ]
      },
      {
        day: 2, title: 'Mysore City Tour', activities: [
          { time: 'Morning', activity: 'Chamundeshwari Temple', description: 'Visit the famous hilltop temple.' },
          { time: 'Afternoon', activity: 'Royal Mysore', description: 'Visit Mysore Maharaja Palace and Brindavan Gardens.' }
        ]
      },
      {
        day: 3, title: 'Heritage & Pilgrimage', activities: [
          { time: 'Morning', activity: 'Halebidu & Belur', description: 'Explore the architectural wonders of Hoysala temples.' },
          { time: 'Evening', activity: 'Transfer to Kukke', description: 'Visit Hornadu Temple and proceed to Kukke Subramanya.' }
        ]
      },
      {
        day: 4, title: 'Subramanya to Udupi', activities: [
          { time: 'Morning', activity: 'Subramanya Darshan', description: 'Visit Kukke Subramanya Temple.' },
          { time: 'Afternoon', activity: 'Dharmasthala & Sringeri', description: 'Visit Dharmasthala and proceed to Sringeri and then to Udupi.' }
        ]
      },
      {
        day: 5, title: 'Coastal Karnataka Tour', activities: [
          { time: 'Morning', activity: 'Udupi & Kollur', description: 'Visit Udupi Krishna Temple and Mookambika Temple at Kollur.' },
          { time: 'Evening', activity: 'Murudeshwar', description: 'Visit Murudeshwar Temple and enjoy the beach.' }
        ]
      },
      {
        day: 6, title: 'Gokarna to Hampi', activities: [
          { time: 'Morning', activity: 'Gokarna Mahabaleshwar', description: 'Visit the sacred Mahabaleshwar temple at Gokarna.' },
          { time: 'Evening', activity: 'Transfer to Hampi', description: 'Journey to the historic city of Hampi and check-in.' }
        ]
      },
      {
        day: 7, title: 'Hampi Heritage & Departure', activities: [
          { time: 'Full Day', activity: 'Hampi Exploring', description: 'Visit Hampi Ruins, TB Dam and local temples.' },
          { time: 'Evening', activity: 'Return Journey', description: 'Return journey to Hyderabad by bus.' }
        ]
      }
    ]
  },
  {
    id: 'dom-12',
    title: 'KASHI-ALLAHABAD SPECIAL',
    category: 'Pilgrimage',
    destination: 'Uttar Pradesh',
    price: '₹14,000',
    priceBasis: 'Per Person',
    duration: '3 Nights - 4 Days',
    image: '/assets/images/KASHI-ALLAHABAD.jpg',
    dates: '2025 Flexible',
    highlights: ['Kashi Vishwanath Temple', 'Triveni Sangam', 'Anand Bhawan', 'Sarnath Sightseeing', 'Ganga Aarti'],
    features: ['AC Vehicle road transportation', 'Breakfast – Lunch – Dinner', 'AC Accommodation (Twin Sharing)', 'Daily one mineral water bottle'],
    itinerary: [
      {
        day: 1, title: 'Arrival Varanasi', activities: [
          { time: 'Morning', activity: 'Arrival Kashi', description: 'Journey from Hyderabad to Varanasi by Flight. Arrival and proceed to Hotel check-in.' },
          { time: 'Evening', activity: 'Rest', description: 'Check in Hotel and rest for the day.' }
        ]
      },
      {
        day: 2, title: 'Prayagraj (Allahabad) Visit', activities: [
          { time: 'Early Morning', activity: 'Triveni Sangam', description: 'Journey to Allahabad. Visit Prayaga Triveni Sangam, perform sacred rituals and Ganga Pooja.' },
          { time: 'Afternoon', activity: 'Local Sights', description: 'Visit Bada Hanuman Temple, Anand bhawan and Madhaveshwari Temple. Return to Kashi for overnight stay.' }
        ]
      },
      {
        day: 3, title: 'Varanasi Local Tour', activities: [
          { time: 'Morning', activity: 'Spiritual Walk', description: 'Visit Kal Bhairav temple, Sarnath and Vyasa Kashi.' },
          { time: 'Afternoon', activity: 'City Temples', description: 'Visit Birla Mandir, Sankatmochan Hanuman mandir, Tulsi manasa mandir, Durga mandir and Gavallama temple.' }
        ]
      },
      {
        day: 4, title: 'Ganga Bath & Departure', activities: [
          { time: 'Morning', activity: 'Main Darshan', description: 'Holy bath in Ganga River and Visit Kashi Viswanath temple, Annapurna Devi Temple and Vishalakshi temple.' },
          { time: 'Afternoon', activity: 'Departure', description: 'Final lunch and drop at Varanasi Airport/Railway station for return journey.', image: '/assets/images/train_fast_2.jpg' }
        ]
      }
    ]
  },
  {
    id: 'dom-13',
    title: 'KERALA SPECIAL PACKAGE',
    category: 'Domestic',
    destination: 'Kerala',
    price: '₹19,500',
    priceBasis: 'Per Person',
    duration: '6 Nights - 7 Days',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944',
    dates: '2025 Flexible',
    highlights: ['Guruvayur Temple', 'Athirampally Waterfalls', 'Munnar Tea Gardens', 'Thekkady Wildlife Sanctuary', 'Kovalam Beach', 'Varkala Cliff', 'Alleppey Backwaters', 'Cochin Marine Drive'],
    features: ['Deluxe Accommodation', 'AC Vehicle road transportation', 'Breakfast – Lunch – Dinner', 'Daily mineral water bottle'],
    itinerary: [
      {
        day: 1, title: 'Arrival & Guruvayur', activities: [
          { time: 'Morning', activity: 'Arrival Cochin', description: 'Arrival at Cochin Airport/Railway station and proceed to Guruvayur.', image: '/assets/images/train_fast_2.jpg' },
          { time: 'Evening', activity: 'Temple Visit', description: 'Visit the sacred Guruvayur temple.' }
        ]
      },
      {
        day: 2, title: 'Athirampally Waterfalls & Munnar', activities: [
          { time: 'Morning', activity: 'Waterfall Visit', description: 'Visit the majestic Athirampally Waterfalls.' },
          { time: 'Afternoon', activity: 'Transfer to Munnar', description: 'Journey to the beautiful hill station of Munnar and check-in.' }
        ]
      },
      {
        day: 3, title: 'Munnar Local Sightseeing', activities: [
          { time: 'Full Day', activity: 'Munnar Exploration', description: 'Visit Flower Garden, Photo Point, Honey Bee tree, Echo point, Madupatty Dam, and Tea Museum.' }
        ]
      },
      {
        day: 4, title: 'Thekkady Wildlife & Culture', activities: [
          { time: 'Morning', activity: 'Nature Tour', description: 'Journey to Thekkady. Visit Spice Garden and Elephant Park.' },
          { time: 'Afternoon', activity: 'Boating & Dance', description: 'Wild life sighting by boat in Periyar Lake. Evening Kalari fight and Cultural dance show.' }
        ]
      },
      {
        day: 5, title: 'Journey to Trivandrum', activities: [
          { time: 'Morning', activity: 'Transfer', description: 'Drive to the capital city, Trivandrum.' },
          { time: 'Afternoon', activity: 'Kovalam Beach', description: 'Relax at the famous Kovalam Beach and enjoy the sunset.' }
        ]
      },
      {
        day: 6, title: 'Spiritual Sights & Backwaters', activities: [
          { time: 'Morning', activity: 'Trivandrum Temple', description: 'Visit the holy Padmanabhaswamy Temple.' },
          { time: 'Afternoon', activity: 'Beach & Backwaters', description: 'Visit Varkala Beach cliff and proceed to Alleppey for a backwater boat cruise. Transfer to Cochin.' }
        ]
      },
      {
        day: 7, title: 'Cochin Sightseeing & Departure', activities: [
          { time: 'Morning', activity: 'Temple & Marine Drive', description: 'Visit Chotanikker Amman temple and enjoy a walk at Marine Drive.' },
          { time: 'Afternoon', activity: 'Departure', description: 'Drop at Cochin Airport/Railway station for return journey.' }
        ]
      }
    ]
  },
  {
    id: 'dom-14',
    title: 'MAHARASHTRA SPECIAL PACKAGE',
    category: 'Pilgrimage',
    destination: 'Maharashtra',
    price: '₹24,000',
    priceBasis: 'Per Person',
    duration: '7 Nights - 8 Days',
    image: 'https://images.unsplash.com/photo-1595658658481-d53d3f999875',
    dates: '2025 Flexible',
    highlights: ['Pandaripuram', 'Kolhapur Mahalakshmi', 'Bhimashankar Jyotirlinga', 'Ashtavinayak Temples', 'Shirdi Sai Baba Darshan', 'Trimbakeshwar', 'Grishneshwar', 'Aundha Nagnath'],
    features: ['AC Bus for road transportation', 'Breakfast – Lunch – Dinner', 'AC Accommodation', 'Daily one mineral water bottle'],
    itinerary: [
      {
        day: 1, title: 'Departure from Hyderabad', activities: [
          { time: 'Evening', activity: 'Journey Starts', description: 'Journey starts from R.V. Tours and Travels Office. Overnight journey towards Pandaripuram.' }
        ]
      },
      {
        day: 2, title: 'Pandaripuram & Kolhapur', activities: [
          { time: 'Morning', activity: 'Pandaripur Temple', description: 'Arrival and visit the sacred Pandaripur temple.' },
          { time: 'Afternoon', activity: 'Transfer to Kolhapur', description: 'Journey to Kolhapur and visit the famous Mahalakshmi temple.' }
        ]
      },
      {
        day: 3, title: 'Pali, Mahad & Pune', activities: [
          { time: 'Morning', activity: 'Pali Temple', description: 'Visit Pali temple and proceed to Mahad.' },
          { time: 'Afternoon', activity: 'Mahad to Pune', description: 'Visit Mahad temple and proceed to Pune for overnight stay.' }
        ]
      },
      {
        day: 4, title: 'Ashtavinayak Circuit (Pune)', activities: [
          { time: 'Morning', activity: 'Theur & Sidhateck', description: 'Visit Theur and Sidhateck temples.' },
          { time: 'Afternoon', activity: 'Morgaon & Ranjangaon', description: 'Visit Morgaon and Ranjangaon temples. Return to Pune.' }
        ]
      },
      {
        day: 5, title: 'Bhimashankar & Ozar', activities: [
          { time: 'Morning', activity: 'Bhimashankar Darshan', description: 'Visit the holy Bhimashankar Jyotirlinga temple.' },
          { time: 'Afternoon', activity: 'Lenyadri & Ozar', description: 'Visit Lenyadri and Ozar temples. Overnight stay at Ozar.' }
        ]
      },
      {
        day: 6, title: 'Trimbakeshwar & Shirdi', activities: [
          { time: 'Morning', activity: 'Trimbakeshwar', description: 'Visit Trimbakeshwar Jyotirlinga temple.' },
          { time: 'Afternoon', activity: 'Transfer to Shirdi', description: 'Proceed to Shirdi for holy darshan and overnight stay.' }
        ]
      },
      {
        day: 7, title: 'Shirdi & Aurangabad', activities: [
          { time: 'Morning', activity: 'Shirdi Darshan', description: 'Early morning visit to Saibaba Temple. Proceed to Shanisingnapur.' },
          { time: 'Afternoon', activity: 'Mini Taj Mahal', description: 'Visit Shanisingnapur and Aurangabad (Mini Taj Mahal).' }
        ]
      },
      {
        day: 8, title: 'Jyotirlinga Darshan & Return', activities: [
          { time: 'Morning', activity: 'Grishneshwar', description: 'Visit Grishneshwar temple and proceed to Parli.' },
          { time: 'Afternoon', activity: 'Final Temples', description: 'Visit Parli Vaidhyanath, Aundanaganath, and Mahur temples. Return journey to Hyderabad.' }
        ]
      }
    ]
  },
  {
    id: 'dom-15',
    title: 'GOA SPECIAL PACKAGE',
    category: 'Domestic',
    destination: 'Goa',
    price: '₹15,000',
    priceBasis: 'Per Person',
    duration: '2 Nights - 3 Days',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2',
    dates: '2025 Flexible',
    highlights: ['Fort Aguada', 'Light House', 'Seqerium Beach', 'Calangute Beach'],
    features: ['Deluxe Accommodation', 'Pickup and Drop from Airport', 'Breakfast & Dinner included', 'Daily mineral water bottle'],
    itinerary: [
      {
        day: 1, title: 'Arrival & Transfer', activities: [
          { time: 'Morning/Afternoon', activity: 'Arrival Goa', description: 'Arrival at Goa and transfer to the hotel for check-in.' },
          { time: 'Evening', activity: 'Dinner', description: 'Enjoy a delicious dinner and relax at the hotel.' }
        ]
      },
      {
        day: 2, title: 'North Goa Sightseeing', activities: [
          { time: 'Morning', activity: 'Fort & Light House', description: 'Visit Fort Aguada, the historic Light House, and Seqerium Beach.' },
          { time: 'Afternoon', activity: 'Personal Time', description: 'Enjoy lunch and have free time for personal activities or exploring local areas.' },
          { time: 'Evening', activity: 'Dinner', description: 'Dinner and overnight stay in Goa.' }
        ]
      },
      {
        day: 3, title: 'Beach & Departure', activities: [
          { time: 'Morning', activity: 'Calangute Beach', description: 'Visit the famous Calangute Beach for some leisure time.' },
          { time: 'Afternoon', activity: 'Check-out & Shopping', description: 'Check out from the hotel and enjoy free time for shopping before departure to the airport.' }
        ]
      }
    ]
  },
  {
    id: 'dom-16',
    title: 'ANDAMAN SPECIAL PACKAGE',
    category: 'Domestic',
    destination: 'Andaman',
    price: '₹36,500',
    priceBasis: 'Per Person',
    duration: '4 Nights - 5 Days',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19',
    dates: '2025 Flexible',
    highlights: ['Portblair Cellular Jail', 'Havelock Island Cruise', 'Radhanagar Beach', 'Elephant Beach Boat Ride', 'Kalpathar Beach'],
    features: ['3 Star AC Accommodation', 'Portblair – Havelock Cruise tickets', 'Breakfast – Lunch – Dinner', 'AC Vehicle for road transportation', 'All Transfers & Entry tickets included'],
    itinerary: [
      {
        day: 1, title: 'Arrival Portblair & Cellular Jail', activities: [
          { time: 'Morning', activity: 'Arrival Portblair', description: 'Journey from Hyderabad. Arrival and transfer to hotel.' },
          { time: 'Afternoon', activity: 'Cellular Jail', description: 'Visit the historic Cellular Jail and enjoy the evening Light & Sound Show.' }
        ]
      },
      {
        day: 2, title: 'Havelock Island & Radhanagar Beach', activities: [
          { time: 'Morning', activity: 'Cruise to Havelock', description: 'Transfer to Harbour and journey to Havelock Island by Cruise.' },
          { time: 'Afternoon', activity: 'Beach Visit', description: 'Check-in at hotel and visit the world-famous Radhanagar Beach.' }
        ]
      },
      {
        day: 3, title: 'Elephant Beach Adventure', activities: [
          { time: 'Morning', activity: 'Elephant Beach', description: 'Boat trip to Elephant beach for water activities and coral viewing.' },
          { time: 'Afternoon', activity: 'Personal Time', description: 'Free time for personal activities and exploring the island.' }
        ]
      },
      {
        day: 4, title: 'Kalapathar Beach & Return to Portblair', activities: [
          { time: 'Morning', activity: 'Kalapathar Beach', description: 'Visit the scenic Kalapathar Beach.' },
          { time: 'Afternoon', activity: 'Cruise to Portblair', description: 'Transfer to harbour and return journey to Portblair by Cruise. Check-in and relax.' }
        ]
      },
      {
        day: 5, title: 'Departure from Portblair', activities: [
          { time: 'Morning', activity: 'Airport Drop', description: 'Breakfast and transfer to Airport for return flight to Hyderabad.' }
        ]
      }
    ]
  },
  {
    id: 'dom-17',
    title: 'GANGTOK-DARJEELING SPECIAL PACKAGE',
    category: 'Domestic',
    destination: 'Sikkim & West Bengal',
    price: '₹24,000',
    priceBasis: 'Per Person',
    duration: '6 Nights - 7 Days',
    image: '/assets/images/GANGTOK-DARJEELING.jpg',
    dates: '2025 Flexible',
    highlights: ['Tiger Hill Sunrise', 'Tsomgo Lake', 'Baba Harbajan Singh Temple', 'Mirik Lake', 'Gangtok Local Sights', 'Darjeeling Local Sights'],
    features: ['Deluxe Accommodation', 'Vehicle for road transportation', 'Breakfast, Lunch, Dinner included', 'Daily one mineral water bottle'],
    itinerary: [
      {
        day: 1, title: 'Arrival & Journey to Gangtok', activities: [
          { time: 'Morning', activity: 'Arrival Bagdogra', description: 'Journey from Hyderabad to Bagdogra. Meet and proceed towards Gangtok.' },
          { time: 'Evening', activity: 'Arrival Gangtok', description: 'Arrival at Gangtok and rest for the night.' }
        ]
      },
      {
        day: 2, title: 'Gangtok Local Sightseeing', activities: [
          { time: 'Morning', activity: 'Gangtok Sights', description: 'Visit Namgyal Institute of Tibetology, Banjakri Falls, Flower Show, Do Drul Chorten Stupa, Enchey Monastery, and Handicrafts Centre.' },
          { time: 'Afternoon', activity: 'Shopping', description: 'Free time for shopping at MG Marg (by own transportation).' }
        ]
      },
      {
        day: 3, title: 'Tsomgo Lake & Baba Mandir', activities: [
          { time: 'Morning', activity: 'Baba Mandir', description: 'Journey to and visit the sacred Baba Harbajan Singh Temple.' },
          { time: 'Afternoon', activity: 'Tsomgo Lake', description: 'Visit the high-altitude Tsomgo Lake before returning to the hotel.' }
        ]
      },
      {
        day: 4, title: 'Journey to Darjeeling', activities: [
          { time: 'Morning', activity: 'Transfer', description: 'Breakfast and scenic journey to Darjeeling.' },
          { time: 'Afternoon', activity: 'Personal Activities', description: 'Check-in and free time for shopping and exploring the Mall Road.' }
        ]
      },
      {
        day: 5, title: 'Darjeeling Sunrise & Local Sights', activities: [
          { time: 'Early Morning', activity: 'Tiger Hill', description: 'Early morning trip to Tiger Hill for a spectacular sunrise over Kanchenjunga.' },
          { time: 'Morning', activity: 'Local Sights', description: 'Visit Tenzing Rock, Tea Gardens, Tibetan Refuse Centre, Ghum Monastery, Batasia Loop, and Zoological Park.' }
        ]
      },
      {
        day: 6, title: 'Mirik Lake & Siliguri', activities: [
          { time: 'Morning', activity: 'Mirik Lake', description: 'Visit the beautiful Mirik Lake and enjoy local lunch.' },
          { time: 'Afternoon', activity: 'Journey to Siliguri', description: 'Proceed to Siliguri for your final overnight stay.' }
        ]
      },
      {
        day: 7, title: 'Departure from Bagdogra', activities: [
          { time: 'Morning', activity: 'Airport Drop', description: 'Breakfast and drop at Bagdogra Airport for return journey to Hyderabad.' }
        ]
      }
    ]
  },
  {
    id: 'dom-18',
    title: 'GUWAHATI-SPECIAL PACKAGE',
    category: 'Domestic',
    destination: 'Assam & Meghalaya',
    price: '₹28,500',
    priceBasis: 'Per Person',
    duration: '6 Nights - 7 Days',
    image: '/assets/images/GUWAHATI.jpg',
    dates: '2025 Flexible',
    highlights: ['Umium Lake View Point', 'Elephant Falls', 'Shillong Peak', 'Double Decker Living Root Bridge', 'Seven Sisters Waterfalls', 'Mawsmai Cave', 'Kamakya Devi Temple'],
    features: ['Deluxe Accommodation', 'Vehicle for road transportation', 'Breakfast, Lunch, Dinner included', 'Daily one mineral water bottle'],
    itinerary: [
      {
        day: 1, title: 'Arrival & Journey to Shillong', activities: [
          { time: 'Morning', activity: 'Arrival Guwahati', description: 'Journey from Hyderabad to Guwahati. Arrival and proceed towards Shillong.' },
          { time: 'Afternoon', activity: 'Umium Lake', description: 'Visit Umium Lake View Point on the way to Shillong. Arrival and rest.' }
        ]
      },
      {
        day: 2, title: 'Shillong Local Sightseeing', activities: [
          { time: 'Morning', activity: 'City Tour', description: 'Visit Don Bosco Museum, Wards Lake, Elephant Falls, Golf Course, and Shillong Peak.' },
          { time: 'Afternoon', activity: 'Shopping', description: 'Free time for shopping in Shillong (by own transportation).' }
        ]
      },
      {
        day: 3, title: 'Journey to Cherrapunjee', activities: [
          { time: 'Morning', activity: 'Scenic Drive', description: 'Journey to Cherrapunjee. Visit Mawkdok Valley and Nohkalikai Falls.' },
          { time: 'Afternoon', activity: 'Nature Stops', description: 'Visit Dainthelen Falls and Ramakrishna Mission. Arrival at hotel and rest.' }
        ]
      },
      {
        day: 4, title: 'Double Decker Root Bridge Trek', activities: [
          { time: 'Morning', activity: 'Root Bridge Trek', description: 'Half day trek to the unique Double Decker Living Root Bridge.' },
          { time: 'Afternoon', activity: 'Waterfalls & Caves', description: 'Visit Seven Sisters Waterfalls, Mawsmai Cave, Khoh Ram Hah, and Eco Park.' }
        ]
      },
      {
        day: 5, title: 'Return to Guwahati', activities: [
          { time: 'Morning', activity: 'Transfer', description: 'Breakfast and journey back to Guwahati.' },
          { time: 'Afternoon', activity: 'Ashram Visit', description: 'Visit Vasista Ashram and Kalakshetra. Stay at Guwahati.' }
        ]
      },
      {
        day: 6, title: 'Guwahati Temples', activities: [
          { time: 'Morning', activity: 'Kamakya Temple', description: 'Visit the famous Kamakya Devi Temple.' },
          { time: 'Afternoon', activity: 'Pilgrimage', description: 'Visit Nabagraha Mandir, Tirupati Balaji Temple, and Sukleswar Temple.' },
          { time: 'Evening', activity: 'Optional Cruise', description: 'Optional Dinner Cruise on the Brahmaputra River.' }
        ]
      },
      {
        day: 7, title: 'Departure from Guwahati', activities: [
          { time: 'Morning', activity: 'Airport Drop', description: 'Breakfast and drop at Guwahati Airport for return flight to Hyderabad.' }
        ]
      }
    ]
  },
  {
    id: 'dom-19',
    title: 'AMARNATH YATRA SPECIAL',
    category: 'Pilgrimage',
    destination: 'J&K, Punjab, Himachal',
    price: '₹55,000',
    priceBasis: 'Per Person',
    duration: '13 Nights - 14 Days',
    image: '/assets/images/AMARNATH YATRA.jpg',
    dates: '2025 Flexible',
    highlights: ['Amarnath Cave Darshan', 'Vaishno Devi', 'Golden Temple Amritsar', 'Wagah Border', 'Srinagar Shikara', 'Ashtavigna Devi Temples', 'Kurukshetra'],
    features: ['Deluxe Accommodation', 'AC Vehicle in plains', 'Breakfast, Lunch, Dinner included', 'Daily one mineral water bottle'],
    itinerary: [
      {
        day: 1, title: 'Arrival Delhi & Akshardham', activities: [
          { time: 'Morning', activity: 'Delhi Arrival', description: 'Pickup at Delhi airport/Railway station and transfer to hotel.', image: '/assets/images/train_fast_2.jpg' },
          { time: 'Evening', activity: 'Akshardham Visit', description: 'Visit the magnificent Akshardham temple. Overnight stay at Delhi.' }
        ]
      },
      {
        day: 2, title: 'Delhi to Amritsar', activities: [
          { time: 'Morning', activity: 'Journey to Amritsar', description: 'Full day journey from Delhi to Amritsar.' },
          { time: 'Evening', activity: 'Rest', description: 'Check in at Amritsar and enjoy dinner.' }
        ]
      },
      {
        day: 3, title: 'Amritsar Local & Wagah Border', activities: [
          { time: 'Morning', activity: 'City Tour', description: 'Visit Amritsar Local sightseeing including Golden Temple.' },
          { time: 'Evening', activity: 'Wagah Border', description: 'Visit Wagah Border ceremony and proceed towards Katra.' }
        ]
      },
      {
        day: 4, title: 'Vaishno Devi Darshan', activities: [
          { time: 'Full Day', activity: 'Trek to Bhawan', description: 'Proceed to Katra Vaishno Devi temple Darshan (12 KMS) by Doli, Horse or walk.' }
        ]
      },
      {
        day: 5, title: 'Katra to Srinagar', activities: [
          { time: 'Morning', activity: 'The Scenic Drive', description: 'Journey starts to Srinagar. Arrival and check in to hotel/houseboat.' }
        ]
      },
      {
        day: 6, title: 'Journey to Baltal', activities: [
          { time: 'Morning', activity: 'Transfer to Base', description: 'Journey to Baltal base camp. Arrival and rest at Base Camp tents.' }
        ]
      },
      {
        day: 7, title: 'Sacred Amarnath Cave Darshan', activities: [
          { time: 'Full Day', activity: 'The Holy Cave', description: 'Visit Amarnath Darshan by Horse or Doli (16 KMS). Night stay at Baltal.' }
        ]
      },
      {
        day: 8, title: 'Return to Srinagar', activities: [
          { time: 'Morning', activity: 'Transfer', description: 'Journey starts back to Srinagar. Enjoy free time for shopping.' }
        ]
      },
      {
        day: 9, title: 'Srinagar Local Sightseeing', activities: [
          { time: 'Full Day', activity: 'Nature Tour', description: 'Complete Srinagar local sightseeing including Mughal Gardens.' }
        ]
      },
      {
        day: 10, title: 'Srinagar to Chamunda Devi', activities: [
          { time: 'Morning', activity: 'Transfer to Himachal', description: 'Full day journey towards Chamunda Devi in Himachal Pradesh. Overnight journey.' }
        ]
      },
      {
        day: 11, title: 'Shaktipeeth Darshan', activities: [
          { time: 'Morning', activity: 'Chamunda & Kangra', description: 'Visit Chamunda Devi and Kangra Devi temples.' },
          { time: 'Afternoon', activity: 'Jwalamukhi', description: 'Visit Jwalamukhi temple and proceed to Chintpurni.' }
        ]
      },
      {
        day: 12, title: 'Chintpurni to Kurukshetra', activities: [
          { time: 'Morning', activity: 'Naina Devi', description: 'Visit Chintpurni temple and Naina Devi temple.' },
          { time: 'Afternoon', activity: 'Transfer', description: 'Journey to Kurukshetra for overnight stay.' }
        ]
      },
      {
        day: 13, title: 'Kurukshetra to Delhi', activities: [
          { time: 'Morning', activity: 'Local Heritage', description: 'Visit Kurukshetra local sightseeing spots.' },
          { time: 'Afternoon', activity: 'Return to Delhi', description: 'Journey back to Delhi for final overnight stay.' }
        ]
      },
      {
        day: 14, title: 'Delhi Departure', activities: [
          { time: 'Morning', activity: 'Transfer', description: 'Check out from hotel and drop at Airport/Railway station for departure.', image: '/assets/images/train_fast_2.jpg' }
        ]
      }
    ]
  },

];

import TourDetails from './components/TourDetails';
import SignUp from './components/SignUp';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('tripflux_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [currentView, setCurrentView] = useState<ViewType>(() => {
    try {
      const saved = localStorage.getItem('tripflux_user');
      return saved ? 'HOME' : 'SIGNUP';
    } catch (e) {
      return 'SIGNUP';
    }
  });

  // Persist user session
  useEffect(() => {
    if (user) {
      localStorage.setItem('tripflux_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('tripflux_user');
    }
  }, [user]);

  // Enforce Sign Up before accessing any content
  useEffect(() => {
    // If no user and not on white-listed pages, force SIGNUP
    if (!user &&
      currentView !== 'SIGNUP' &&
      status !== AppStatus.ADMIN &&
      status !== AppStatus.ADMIN_LOGIN) {
      setCurrentView('SIGNUP');
    }

    // Safety: If user exists and we are still on SIGNUP, go HOME
    if (user && currentView === 'SIGNUP') {
      setCurrentView('HOME');
    }
  }, [user, currentView, status]);

  const [signatureTours, setSignatureTours] = useState<TourPackage[]>([]);
  const [selectedTour, setSelectedTour] = useState<TourPackage | null>(null);
  const [isToursLoading, setIsToursLoading] = useState(true);
  const [activeHero, setActiveHero] = useState(0);
  const heroImages = [
    '/assets/images/wing-plane-left.jpg',
    '/assets/images/train_fast_2.jpg',
    '/assets/images/coal_train2.jpg',
    '/assets/images/flight_window.jpg'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHero((prev) => (prev + 1) % heroImages.length);
    }, 1500); // Faster interval
    return () => clearInterval(timer);
  }, [heroImages.length]);


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
    setCurrentView('HOME'); // Redirect to home after successful auth
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
      {/* Hero Section */}
      <section className="relative h-[85vh] w-full overflow-hidden">
        {heroImages.map((img, idx) => (
          <img
            key={idx}
            src={img}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out ${activeHero === idx ? 'opacity-100' : 'opacity-0'}`}
            alt="Hero Background"
          />
        ))}
        <div className="absolute inset-0 bg-black/30"></div>

        <div className="absolute inset-0 bg-gradient-to-t from-[#0c2d3a] via-[#0c2d3a]/20 to-transparent flex flex-col justify-center items-center text-center px-6">
          <div className="max-w-4xl space-y-6">
            <span className="text-indigo-400 font-extrabold text-[10px] uppercase tracking-[0.5em] mb-4 block animate-in slide-in-from-top-4 duration-700">EXPERIENCE THE EXTRAORDINARY</span>
            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tighter uppercase leading-[0.9] animate-in slide-in-from-bottom-8 duration-1000">
              Your Journey, <br /> Our Intelligence
            </h1>
            <p className="text-white/80 text-sm md:text-lg font-medium max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1200 delay-300">
              Discover breathtaking destinations with AI-curated itineraries and premium local grounding.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 animate-in fade-in slide-in-from-bottom-16 duration-1200 delay-500">
              <button
                onClick={() => setCurrentView('INTERNATIONAL')}
                className="px-10 py-4 bg-white text-[#0c2d3a] rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-50 transition-all shadow-2xl hover:scale-105"
              >
                International Tours
              </button>
              <button
                onClick={() => setCurrentView('PILGRIMAGE')}
                className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-700 transition-all shadow-2xl hover:scale-105"
              >
                Temple Specials
              </button>
            </div>
          </div>
        </div>

        {/* Hero Navigation Dots */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-30">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveHero(idx)}
              className={`w-12 h-1.5 rounded-full transition-all duration-500 ${activeHero === idx ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]' : 'bg-white/30 hover:bg-white/50'}`}
            ></button>
          ))}
        </div>
      </section>



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
      {/* Top Banner and Header - Hidden on SIGNIFICANT pages or if not logged in */}
      {currentView !== 'TOUR_DETAILS' && currentView !== 'SIGNUP' && (
        <>
          <div className="bg-[#0c2d3a] text-white py-1.5 px-6 flex justify-center items-center text-[10px] font-bold border-b border-white/5 space-x-4">
            <span className="opacity-80">== WELCOME TO TRIPFLUX ==</span>
            <span className="opacity-80">CUSTOMER CARE NO : {contactPhone} ==</span>
          </div>

          <Header
            user={user}
            onLogout={() => { setUser(null); setCurrentView('SIGNUP'); }}
            onSignIn={() => { setCurrentView('SIGNUP'); window.scrollTo(0, 0); }}
            onViewChange={(view) => { setCurrentView(view); window.scrollTo(0, 0); }}
            onAdminClick={() => { window.location.hash = 'admin'; setStatus(AppStatus.ADMIN_LOGIN); }}
            onAssociateLogin={() => { setCurrentView('SIGNUP'); window.scrollTo(0, 0); }}
            currentView={currentView}
          />
        </>
      )}

      {status === AppStatus.ADMIN_LOGIN ? (
        <AdminLogin onSuccess={() => setStatus(AppStatus.ADMIN)} onCancel={() => setStatus(AppStatus.IDLE)} />
      ) : status === AppStatus.ASSOCIATE_LOGIN ? (
        <AssociateLogin onSuccess={() => setStatus(AppStatus.IDLE)} onCancel={() => setStatus(AppStatus.IDLE)} />
      ) : status === AppStatus.ADMIN ? (
        <AdminDashboard onAddTour={async (t) => { await dbService.saveTour(t); setSignatureTours([t, ...signatureTours]); }} onClose={() => { window.location.hash = ''; setStatus(AppStatus.IDLE); }} />
      ) : (
        currentView === 'SIGNUP' ? (
          <SignUp onBack={() => { }} onSuccess={(user) => { setUser(user); setCurrentView('HOME'); }} />
        ) : currentView === 'TOUR_DETAILS' && selectedTour ? (
          <TourDetails tour={selectedTour} onBack={() => setCurrentView('INTERNATIONAL')} />
        ) : (
          <main className="min-h-screen bg-white">
            {currentView === 'HOME' && renderHome()}
            {currentView === 'INTERNATIONAL' && renderCategoryPage('International Special Packages', getToursByCategory('International'))}
            {currentView === 'DOMESTIC' && renderCategoryPage('Domestic Specials Packages', getToursByCategory('Domestic'))}
            {currentView === 'PILGRIMAGE' && renderCategoryPage('Temple Special Packages', getToursByCategory('Pilgrimage'))}
            {currentView === 'ABOUT' && <AboutUs />}
            {currentView === 'CONTACT' && <ContactUs />}
            {currentView === 'SIGNUP' && <SignupPage onBack={() => setCurrentView('HOME')} onAuthSuccess={handleAuthSuccess} />}

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
