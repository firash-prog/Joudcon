-- JOUDCON seed: real content migrated from joudcon.com (run after schema.sql + storage.sql)

insert into pages (key,title_en,title_ar,status) values
 ('home','Home','الرئيسية','published'),
 ('services','Services','خدماتنا','published'),
 ('projects','Projects','مشاريعنا','published'),
 ('workshop','Workshop','الورشة','published'),
 ('contact','Contact','اتصل بنا','published');

-- HOME: hero (editable via Admin → Website → Home → hero)
insert into page_sections (page_id,section_key,data,sort_order) values
 ((select id from pages where key='home'),'hero','{
   "kicker_en":"Premium Event Management — Dammam, KSA","kicker_ar":"إدارة فعاليات فاخرة — الدمام، السعودية",
   "headline_en":"WE DESIGN. WE BUILD. WE DELIVER EXPERIENCES.","headline_ar":"نصمّم. نبني. نُنفّذ تجارب استثنائية.",
   "sub_en":"Conferences, exhibitions and corporate events — engineered end-to-end, from first sketch to final install.",
   "sub_ar":"مؤتمرات ومعارض وفعاليات شركات — من أول فكرة حتى التنفيذ النهائي.",
   "image_asset":null,"video_path":null,"video_poster":null,"motion_enabled":true,
   "cta1_en":"Start a Project","cta1_ar":"ابدأ مشروعك","cta1_url":"#contact",
   "cta2_en":"View Our Work","cta2_ar":"شاهد أعمالنا","cta2_url":"#projects"}',0),
 ((select id from pages where key='home'),'about','{
   "title_en":"Established in Dammam, March 2010","title_ar":"تأسست في الدمام، مارس 2010",
   "body_en":"Building a reputation for delivering events with creativity and ingenuity. Our journey began with a vision to redefine event management in the Eastern Province.",
   "body_ar":"بنينا سمعتنا في تنظيم فعاليات بإبداع وبراعة، برؤية redefine لإدارة الفعاليات في المنطقة الشرقية.",
   "milestones":[
     {"year":"2010","title_en":"Established in Dammam","title_ar":"التأسيس في الدمام","body_en":"Vision to redefine event management in the Eastern Province.","body_ar":"رؤية لإعادة تعريف إدارة الفعاليات في المنطقة الشرقية."},
     {"year":"2023","title_en":"Expansion & Growth","title_ar":"التوسع والنمو","body_en":"New corporate headquarters in Al Mazruiyah, Dammam.","body_ar":"مقرنا الجديد في حي المزروعية بالدمام."},
     {"year":"2026","title_en":"State-of-the-Art Workshop","title_ar":"ورشة متطورة","body_en":"In-house fabrication workshop for custom exhibits.","body_ar":"ورشة تصنيع داخلية للمنصات والمعارض المخصصة."}]}',1),
 ((select id from pages where key='home'),'cta','{
   "title_en":"Every experience has a unique identity. We create it.","title_ar":"كل تجربة لها هوية فريدة. نحن نصنعها.",
   "body_en":"Tell us about your event.","body_ar":"أخبرنا عن فعاليتك.",
   "button_en":"Start a Project","button_ar":"ابدأ مشروعك","url":"#contact"}',8);

-- SERVICES (3 live from old site + 9 as drafts, per suggested architecture)
insert into services (slug,name_en,name_ar,short_en,short_ar,detail_en,detail_ar,capabilities,status,sort_order) values
 ('conference-management','Conference Management','إدارة المؤتمرات',
  'Strategic conference approaches and world-class exhibition management.',
  'أساليب مؤتمرات استراتيجية وإدارة معارض بمعايير عالمية.',
  'Full conference design, program strategy, speaker and delegate management, staging and delivery.',
  'تصميم المؤتمرات كاملة، استراتيجية البرنامج، إدارة المتحدثين والحضور، التنفيذ.',
  '["Program strategy","Stage design","Delegate management","AV & LED","Simultaneous interpretation"]',
  'published',1),
 ('event-management','Event Management & Creative Execution','إدارة الفعاليات والتنفيذ الإبداعي',
  'Full-service event accompaniment with top artists and advanced equipment.',
  'مرافقة متكاملة للفعاليات مع أفضل الفنانين وأحدث المعدات.',
  'Concept to show-calling: creative direction, artists, AV, lighting and show flow.',
  'من الفكرة إلى إدارة العرض: الإخراج الإبداعي، الفنانون، الصوتيات والإضاءة.',
  '["Creative direction","Show calling","Artist booking","Lighting design"]',
  'published',2),
 ('logistics-support','Premium Logistics & Support','الخدمات اللوجستية والدعم',
  'Efficient routing for supplies with comprehensive monitoring.',
  'توجيه فعال للمعدات مع مراقبة شاملة.',
  'Transport routing, warehousing, on-site installation teams and full monitoring.',
  'توجيه النقل، التخزين، فرق التركيب في الموقع والمراقبة الكاملة.',
  '["Routing","Warehousing","Installation crews","Monitoring"]',
  'published',3),
 ('exhibition-management','Exhibition Management','إدارة المعارض','','','','','[]','draft',4),
 ('corporate-events','Corporate Events','فعاليات الشركات','','','','','[]','draft',5),
 ('booth-design-build','Booth Design & Build','تصميم وبناء الأجنحة','','','','','[]','draft',6),
 ('stage-backdrop-production','Stage & Backdrop Production','إنتاج المسارح والخلفيات','','','','','[]','draft',7),
 ('branding-printing','Branding & Printing','الهوية والطباعة','','','','','[]','draft',8),
 ('av-led-lighting','AV / LED / Lighting','الصوتيات والشاشات والإضاءة','','','','','[]','draft',9),
 ('in-house-fabrication','In-House Fabrication','التصنيع الداخلي','','','','','[]','draft',10),
 ('event-manpower','Manpower & Support','القوى العاملة والدعم','','','','','[]','draft',11),
 ('cultural-events','Special / Cultural Events','الفعاليات الثقافية الخاصة','','','','','[]','draft',12);

-- PROJECTS (real portfolio from old site)
insert into projects (slug,name_en,name_ar,client,location_en,location_ar,year,category,event_type,
 summary_en,summary_ar,description_en,description_ar,is_featured,status,sort_order,published_at) values
 ('aramco-updc-fun-day','Aramco UPDC Fun Day','يوم المرح لأرامكو UPDC','Saudi Aramco','Half Moon Beach','شاطئ نصف القمر',2025,'Corporate','Corporate Event',
  'End-to-end corporate event for Aramco Planning & Project Department at Half Moon Beach.',
  'فعالية متكاملة لإدارة التخطيط والمشاريع في أرامكو بشاطئ نصف القمر.',
  'Comprehensive venue design, advanced AV deployment, and branded environments.',
  'تصميم شامل للموقع، نشر أنظمة صوتيات متقدمة، وبيئات بهوية الشركة.',true,'published',1,now()),
 ('service-award-ceremony','Service Award Ceremony','حفل جوائز الخدمة','Saudi Aramco','Dammam','الدمام',2024,'Award Ceremony','Award Ceremony',
  'Elegant award ceremony celebrating 25 years of service excellence.',
  'حفل أنيق احتفالاً بـ 25 عاماً من التميز في الخدمة.',
  'Custom stage design, professional lighting, and seamless program coordination.',
  'تصميم مسرح مخصص، إضاءة احترافية، وتنسيق سلس للبرنامج.',true,'published',2,now());

-- CLIENTS
insert into clients (name,is_featured,is_visible,sort_order) values ('Saudi Aramco',true,true,1);

-- PROCESS (7 stages)
insert into process_stages (key,name_en,name_ar,sort_order) values
 ('idea','IDEA','الفكرة',1),('design','DESIGN','التصميم',2),
 ('engineer','ENGINEER','الهندسة',3),('fabricate','FABRICATE','التصنيع',4),
 ('logistics','LOGISTICS','اللوجستيات',5),('execute','EXECUTE','التنفيذ',6),
 ('experience','EXPERIENCE','التجربة',7);

-- STATISTICS (hidden until owner verifies numbers)
insert into statistics (label_en,label_ar,value,suffix,sort_order,is_visible) values
 ('Years Experience','سنوات من الخبرة',15,'+',1,false),
 ('Events Delivered','فعالية نفذناها',500,'+',2,false),
 ('Clients','عملاء',120,'+',3,false),
 ('Locations','مواقع',30,'+',4,false);

-- WORKSHOP
insert into workshop (id,title_en,title_ar,description_en,description_ar,capabilities,cta_en,cta_ar,status) values
 (1,'State-of-the-Art Workshop','ورشتنا المتطورة',
  'In-house fabrication workshop to design and build custom exhibits — precision and excellence, in-house.',
  'ورشة تصنيع داخلية لتصميم وبناء المعارض المخصصة بدقة وتميّز.',
  '["Concept","Design","Engineering","Fabrication","Printing","Assembly","Quality Control","Logistics","Installation"]',
  'Start a build project','ابدأ مشروع تصنيع','published');

-- SITE SETTINGS + SEO
insert into site_settings (id,company_en,company_ar,address_en,address_ar,phones,emails,whatsapp,hours_en,hours_ar,social,maps_url) values
 (1,'Joudcon Event Management','جودكون لإدارة الفعاليات',
  'Al Mazruiyah, Dammam, Eastern Province, Saudi Arabia','حي المزروعية، الدمام، المنطقة الشرقية، السعودية',
  '[]','["hello@joudcon.com"]','','Sun–Thu, 9:00–18:00','الأحد–الخميس، ٩:٠٠–١٨:٠٠',
  '{}','https://maps.google.com/?q=Al+Mazruiyah+Dammam');

insert into seo_meta (page_key,title_en,title_ar,description_en,description_ar) values
 ('home','Joudcon — Premium Event Management | Dammam, KSA','جودكون — إدارة فعاليات فاخرة | الدمام',
  'Conferences, exhibitions and corporate events, engineered end-to-end in Saudi Arabia''s Eastern Province since 2010.',
  'مؤتمرات ومعارض وفعاليات شركات بمعايير عالمية في المنطقة الشرقية منذ 2010.');
