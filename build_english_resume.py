from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, PageBreak, KeepTogether

OUT = Path('output/pdf/Wellem_Mello_de_Lyra_Resume_EN_final.pdf')
OUT.parent.mkdir(parents=True, exist_ok=True)
PAGE_W, PAGE_H = A4
NAVY = colors.HexColor('#17365D')
BLUE = colors.HexColor('#2E75B6')
GRAY = colors.HexColor('#5C6670')
LIGHT = colors.HexColor('#EAF1F8')

styles = getSampleStyleSheet()
body = ParagraphStyle('body', parent=styles['BodyText'], fontName='Helvetica', fontSize=8.2, leading=10.6,
                      textColor=colors.HexColor('#202830'), spaceAfter=3)
bullet = ParagraphStyle('bullet', parent=body, leftIndent=9, firstLineIndent=-7, bulletIndent=0, spaceAfter=3)
company = ParagraphStyle('company', parent=body, fontName='Helvetica-Bold', fontSize=10.2, leading=12,
                         textColor=NAVY, spaceBefore=4, spaceAfter=1)
role = ParagraphStyle('role', parent=body, fontName='Helvetica-Bold', fontSize=8.4, leading=10.5,
                      textColor=GRAY, spaceAfter=4)
section = ParagraphStyle('section', parent=body, fontName='Helvetica-Bold', fontSize=10.5, leading=13,
                         textColor=NAVY, spaceBefore=2, spaceAfter=5)
tech = ParagraphStyle('tech', parent=body, fontName='Helvetica-Oblique', fontSize=7.6, leading=9.5,
                      textColor=GRAY, spaceAfter=5)
side_title = ParagraphStyle('side_title', fontName='Helvetica-Bold', fontSize=8.5, leading=10,
                            textColor=NAVY, spaceBefore=7, spaceAfter=3)
side = ParagraphStyle('side', fontName='Helvetica', fontSize=7.5, leading=9.5, textColor=colors.HexColor('#28323C'), spaceAfter=2)
side_bullet = ParagraphStyle('side_bullet', parent=side, leftIndent=7, firstLineIndent=-6, spaceAfter=2)

def P(text, style=body): return Paragraph(text, style)
def B(text): return Paragraph('&bull; ' + text, bullet)

def sidebar(canvas, doc):
    canvas.saveState()
    x = 15*mm; y = PAGE_H - 25*mm
    # Keep the sidebar identity fully inside its column so it never intrudes into the main content.
    canvas.setFillColor(NAVY); canvas.setFont('Helvetica-Bold', 10.5)
    canvas.drawString(x, y, 'WELLEM MELLO')
    canvas.drawString(x, y-11, 'DE LYRA')
    canvas.setFillColor(BLUE); canvas.setFont('Helvetica-Bold', 6.5)
    canvas.drawString(x, y-22, 'Senior Java Developer | Full-Stack | Cloud')
    text = canvas.beginText(x, y-45); text.setFont('Helvetica-Bold', 8.5); text.setFillColor(NAVY)
    text.textLine('CONTACT'); canvas.drawText(text)
    contact = ['Rio de Janeiro, RJ, Brazil', '+55 21 99040-3514', 'wellemlyra@gmail.com']
    yy = y-57; canvas.setFillColor(colors.HexColor('#28323C')); canvas.setFont('Helvetica', 7.5)
    for line in contact: canvas.drawString(x, yy, line); yy -= 10
    def block(title, lines):
        nonlocal yy
        yy -= 5; canvas.setFillColor(NAVY); canvas.setFont('Helvetica-Bold', 8.5); canvas.drawString(x, yy, title); yy -= 11
        canvas.setFillColor(colors.HexColor('#28323C')); canvas.setFont('Helvetica', 7.3)
        max_width = 41 * mm
        for line in lines:
            words, wrapped, current = line.split(), [], ''
            for word in words:
                candidate = (current + ' ' + word).strip()
                if current and pdfmetrics.stringWidth(candidate, 'Helvetica', 7.3) > max_width:
                    wrapped.append(current)
                    current = word
                else:
                    current = candidate
            if current:
                wrapped.append(current)
            for wrapped_line in wrapped:
                canvas.drawString(x, yy, wrapped_line); yy -= 9
    block('KEY SKILLS', ['Java 21 and Spring Boot', 'React 18+, Next.js and TypeScript', 'Clean Architecture and SOLID', 'REST APIs, GraphQL and microservices', 'Docker and Kubernetes', 'Cloud: AWS and Azure', 'GitLab, CI/CD and Git', 'MongoDB and relational databases', 'Testing and code review', 'Observability and performance'])
    block('EDUCATION', ['Systems Analysis and Development', 'Estacio de Sa University - 2023'])
    block('LANGUAGES', ['Advanced English - CCAA'])
    block('COURSES', ['Git - Udemy (2023)', 'Reactive Microservices with Spring Boot - Udemy (2023)', 'TypeScript - Udemy (2023)', 'RabbitMQ - Udemy (2022)', 'AngularJS - Udemy (2022)', 'Amazon DynamoDB - Udemy (2022)', 'JSTL + Hibernate - T2Ti', 'JSF + Hibernate - T2Ti', 'UML and Data Modeling - Oracle'])
    canvas.setStrokeColor(colors.HexColor('#D8E2ED')); canvas.setLineWidth(.5); canvas.line(58*mm, 12*mm, 58*mm, PAGE_H-12*mm)
    canvas.setFillColor(GRAY); canvas.setFont('Helvetica', 7); canvas.drawString(15*mm, 10*mm, f'Executive resume - page {doc.page}')
    canvas.restoreState()

def experience(name, dates, role_text, bullets, technologies):
    story = [P(name, company), P(f'{dates} | {role_text}', role)]
    story += [B(t) for t in bullets]
    story.append(P('<b>Technologies and practices:</b> ' + technologies, tech))
    return story

doc = BaseDocTemplate(str(OUT), pagesize=A4, leftMargin=64*mm, rightMargin=14*mm, topMargin=17*mm, bottomMargin=15*mm)
main = Frame(64*mm, 15*mm, 117*mm, 811*0.95, leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
doc.addPageTemplates([PageTemplate(id='resume', frames=[main], onPage=sidebar)])

story = []
story += [P('PROFESSIONAL SUMMARY', section),
          P('Senior Java / Full-Stack Developer with a career focused on the development, evolution and support of high-criticality enterprise applications. Experience with Java 21, Spring Boot, React 18+, Next.js and TypeScript, REST APIs, integrations and microservices in large-scale environments.'),
          P('Skilled in Clean Architecture, Hexagonal Architecture, SOLID, code review, unit and integration testing. Hands-on experience with AWS/Azure, Docker, Kubernetes, CI/CD, observability and performance, collaborating in agile Scrum and Kanban teams.'),
          P('TECHNICAL SKILLS', section),
          P('<b>Backend and architecture</b><br/>Java 21 and earlier versions, Java EE, Spring Boot, REST, SOAP, GraphQL, microservices, Clean Architecture, Hexagonal Architecture and SOLID.'),
          P('<b>Frontend</b><br/>React 18+, Next.js, JavaScript, TypeScript, Vite, Context API, TanStack Query, Tailwind CSS, Shadcn/ui and Radix UI.'),
          P('<b>Data and quality</b><br/>MongoDB, PostgreSQL, SQL Server, DynamoDB, unit and integration testing, Jest, Playwright, code review and Fortify.'),
          P('<b>Cloud, delivery and collaboration</b><br/>AWS, Azure, Docker, Kubernetes, Git, GitLab, Jenkins, CI/CD, Keycloak, observability, performance, Scrum and Kanban.'),
          P('PROFESSIONAL EXPERIENCE', section)]
story += experience('Qintess', '08/2025 - 07/2026', 'Full-Stack Developer / Programmer', [
    'Developed, enhanced and supported full-stack applications using Java 21, Spring Boot, React 18+, Next.js and TypeScript, including integrations with Java EE, EJB, JAX-RS and Angular systems.',
    'Performed technical analysis and contributed to the design of REST and GraphQL APIs, integrations and scalable microservices, applying Clean Architecture, Hexagonal Architecture and SOLID principles.',
    'Built interfaces with Vite, Context API, TanStack Query, Tailwind CSS, Shadcn/ui and Radix UI; managed state with Zustand, Effector and Redux.',
    'Promoted code quality through code reviews, unit and integration tests, Jest and Playwright; worked with MongoDB and SQL Server, including stored procedures and triggers.',
    'Managed version control and delivery with Git, GitLab, Jenkins and CI/CD; worked with AWS/Azure, Docker, Kubernetes and Keycloak, focused on observability, performance and troubleshooting.',
    'Participated in Scrum ceremonies and Kanban workflows, contributing to continuous improvement in engineering and application support practices.'
], 'Java 21, Spring Boot, React 18+, Next.js, JavaScript, TypeScript, REST APIs, GraphQL, Vite, Context API, TanStack Query, Tailwind CSS, Shadcn/ui, Radix UI, Zustand, Effector, Redux, MongoDB, SQL Server, GitLab, CI/CD, Kubernetes, AWS, Docker, Keycloak, Jest and Playwright.')
story.append(PageBreak())
story += experience('Globality IT', '03/2023 - 07/2025', 'Senior Systems Analyst / Java Developer', [
    'Developed and supported RESTful and GraphQL APIs and Open Insurance integrations using Java, Spring Boot and microservices; contributed to technology evolution including Java 21.',
    'Worked full-stack with React 18+, Next.js, JavaScript and TypeScript, integrating interfaces with APIs and using MongoDB and PostgreSQL.',
    'Participated in architecture decisions and technical analysis, applying Clean Architecture, Hexagonal Architecture and SOLID to scalable solutions.',
    'Performed code reviews, unit and integration tests, and vulnerability remediation with Fortify, supporting reliable and secure deliveries.',
    'Used Git/GitLab and SVN, Jenkins and CI/CD; worked with AWS/Azure, Docker, Kubernetes, OpenShift/Rancher, observability and performance analysis.',
    'Collaborated in Scrum and Kanban ceremonies, application support and continuous improvement of enterprise applications.'
], 'Java 21 and earlier versions, Spring Boot, React 18+, Next.js, JavaScript, TypeScript, REST APIs, GraphQL, microservices, MongoDB, PostgreSQL, Git, GitLab, Jenkins, CI/CD, AWS, Azure, Docker, Kubernetes, Fortify, Clean Architecture, Hexagonal Architecture and SOLID.')
story += experience('Stefanini', '04/2021 - 02/2023', 'Senior Systems Analyst / Java Developer', [
    'Worked in full-stack development, building APIs, integrations and web interfaces with a focus on usability, maintainability and product evolution.',
    'Implemented screens and components with React, Next.js and Tailwind CSS, integrated with services and relational databases.',
    'Used PostgreSQL and Git while collaborating in agile teams, including technical communication in English in a professional context.',
    'Supported cloud environments and delivery flows with CI/CD, Docker and versioning practices, contributing to standardized and predictable deployments.',
    'Applied concepts related to Java 17+, cloud, Kubernetes, orchestration, infrastructure as code, observability, monitoring and troubleshooting throughout application support and evolution.'
], 'Java 17+, Spring, APIs, Next.js, React, Tailwind CSS, PostgreSQL, Git, AWS, Azure, Docker, Kubernetes, CI/CD, infrastructure as code, observability, authentication/authorization and troubleshooting.')
story += experience('MJV Technology and Innovation', '10/2019 - 03/2021', 'Senior Systems Analyst / Java Developer', [
    'Developed RESTful APIs and created and consumed web services through REST and SOAP.',
    'Created reports for healthcare and dental business areas, supporting operational processes and business needs.',
    'Performed corrective and evolutionary maintenance of enterprise applications, ensuring operational continuity and continuous system improvement.'
], 'JSF, Web Services, REST, SOAP, Ajax, J2EE, Java 6/7/8, Spring and JasperReports.')
story += experience('Spread Tecnologia S/A', '01/2019 - 09/2019', 'Senior Systems Analyst / Java Developer', [
    'Performed corrective and evolutionary maintenance of enterprise applications, focused on stability, continuity and business demand fulfillment.',
    'Created and maintained applications using AngularJS, as well as REST and SOAP web service integrations.',
    'Worked with C, C++ and Mainframe technologies, expanding experience in heterogeneous and legacy-system environments.',
    'Automated applications using Selenium and led a team supporting critical Petrobras contract applications.'
], 'Struts, Web Services, REST, SOAP, Ajax, jQuery, J2EE, Spring, Spring Boot, AngularJS, Selenium, C, C++ and Mainframe.')
story.append(PageBreak())
story += experience('Accenture do Brasil S/A', '04/2015 - 10/2018', 'Senior Systems Analyst / Java Developer', [
    'Developed and maintained financial applications, focused on feature evolution, incident resolution and delivery quality.',
    'Used C, C++ and Mainframe alongside Java solutions, supporting integrations and automation in complex enterprise environments.',
    'Automated applications with direct interaction with the mainframe platform using Selenium.',
    'Created and consumed REST web services, developed Java Swing desktop applications and created stored procedures.'
], 'Struts, Web Services, REST, Ajax, jQuery, Swing, J2EE, Spring, Selenium, C, C++, Mainframe and stored procedures.')
story += experience('K2 Consultoria LTDA', '03/2014 - 03/2015', 'Senior Systems Analyst / Java Developer', [
    'Developed software for the telecommunications sector.',
    'Developed and maintained financial applications, working on support, evolution and feature improvements.'
], 'Spring, Web Services, Ajax, jQuery, JasperReports and J2EE.')
story += experience('Quality Software LTDA', '07/2013 - 03/2014', 'Senior Systems Analyst / Java Developer', [
    'Developed software for naval fleets, financial applications and collection management.',
    'Contributed to projects for Tranship, CETIP and TV Brasil, supporting analysis, development, maintenance and enterprise integrations.'
], 'Struts, Web Services, Ajax, jQuery, JasperReports, J2EE, Java 6/7/8, EJB, JSF and Spring.')
story += experience('Systemplan HR and IT Consulting LTDA', '07/2011 - 05/2013', 'Senior Systems Analyst / Java Developer', [
    'Developed software for enterprise environments, working in analysis, coding, maintenance and production support.',
    'Trained new Java programming interns and provided technical support to the team.',
    'Participated in external audit-control and health/accessibility portal projects for Bradesco Seguros.'
], 'Struts, Web Services, Ajax, jQuery, JasperReports, J2EE, EJB, JSF, Spring, DWR and Cobol/CICS.')
story += [P('EDUCATION, LANGUAGES AND COURSES', section),
          P('<b>Degree:</b> Systems Analysis and Development - Estacio de Sa University - completed in 2023.<br/><b>Language:</b> Advanced English - CCAA.<br/><b>Additional courses:</b> Git, Reactive Microservices using Spring Boot, TypeScript, UX &amp; Design Thinking, RabbitMQ, AngularJS, Amazon DynamoDB, JSTL + Hibernate, JSF + Hibernate, UML and Data Modeling.', body)]
doc.build(story)
print(OUT.resolve())
