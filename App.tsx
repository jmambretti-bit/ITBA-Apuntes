import { useEffect, useMemo, useRef, useState } from "react";

const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
const DRIVES = [
  ["Drive 1", "https://drive.google.com/drive/folders/1EEUG9f-Q64vL6ew8CMKMc703_lT_tHLj?usp=drive_link"],
  ["Drive 2", "https://drive.google.com/drive/folders/1JnsemBgkwMpzjMSu8n1EK_Rs3EnyAyHi?usp=drive_link"],
  ["Drive 3", "https://drive.google.com/drive/folders/1StSnMH-Im2ivPEbV-Pclyt8dd18bRp-q?usp=drive_link"],
  ["Drive 4", "https://drive.google.com/drive/folders/1qeV3rddEyzOD3E6-iub53kUa2YJsY1tD?usp=drive_link"],
];
const DRV: Record<string, string[]> = {};
`Análisis Matemático I|1-5zQh3JYyxQWtWcnYCSexGXpPt_MH1yA,1oMWfyB2VeAL6eaQBVYpiu1tx3YaM2_Le
Análisis Matemático II|1RiJMb_NiIlDEQrRE4_TSt2qyNDN1jt8E,19opzicu3DcRPD4E5XLqgeu05oiMvDkwz
Análisis Matemático III|19W-AWt4MDT4K05ZuV9PeswN4oty121HF,1kKCs2ZxkvviRifesDgwi_AkYq227bX1Q
Análisis Matemático IV|114CktdpeLeel5o_NmKTYYaUCuACk0WD-,1pvr9yBy23Ll9HCotw6oV2yPVMeXBXay8,1-Hx_jIJl8s0AhnvI68FSAAiQuFJGRK0H
Álgebra Lineal|1-5Qwmza73MPiz77doo1eUK9qY5Me2X9t,1ubKd7ye-NenSkHCXnQSzssyYdYPkHCpi,1IadASxR8-RlhzPEP9Bf7UBH-7pICZfDd
Química General|1-5gSTUiGDyYu-EnWoUjiF95zScCzbXZO,15OVU4V3lyzp3vIzbCYt9g--CrGjekW-D
Informática General|10jBRYrFyXimfUfsJsBYijieLpgucMYqu,15wTypiNGy23kpdrRR7Jiwy2zQL-VAXla,1c28pdjphBUkvFKZtr4-jlY1o56jB8pmh
Física I|1GD0rix6n1ucwwA95cMdwMLbrzucl3THV,1yriIMZtXN9mmLyZw6Drx_qkefAaww7TU
Física II|1samuAiukpcV9GZjnOofC0fh4XC4UtG-r,1dn9_qzmA20Gqoq2XdHvYivpCFuvE41wN
Física III|1HyaLCJIpIJaFCbpoejgMKQK7Si_Vu4Bq,14i49bzJzzlllbCXgTuO7rVLx4r8BoTTM
Biología|1pWHXi_yDkL6X9PTnAH0ZEK1xobYg2iXV,1VoeYgRCkfBGC-JoUrXufMYSDdW_bXlV7
Sistemas de Representación|1Nyz3xECE9R6DlM2KYuDBIL1iQW1ROemB,1BDDdbN21mbXXA7Z4EuzMosnhlXdKSFV9
Tecnología y Sociedad|1V3djEy11XdTCq3R034eYfReR_r71kxN2
Certificaciones Tecnológicas|1RIM3PnB3BYRIEFfKLiNFIQbI8V1c9dRb,1__oe6bk0J7_S-Q8yfifQtzM4CYLmETKr
Introducción a la Ingeniería Química|1rliaNsqj-IqQIas6U2TUcZ4o0I1i_8Ef,13RstOI-ExvUEjWs9UvqYdprcyF0vHvyf
Introducción a la Ingeniería Mecánica|1e5XU2N4q7lCSytqWPRzwNFg4il704839
Fundamentos de Química Orgánica|1LTGLuX8Jb9-nL6GrqU51ZKREknRZ61uC
Ciencia de Materiales I|14BkCMgUOJsUsO1erlzPjGRjdrCPZePbK
Ciencia de Materiales II|1KaynaxF6R7qMwbx0Q1jKoLkinfbKkHUL
Gestión de Datos|1l3Oc5K6MdrwB30b957HqQQlJfp9iTOy4,1aZyiGBjfNjKUCRGqnIBUAVv5BGNAJ82J
Principios de Informática|~1BplF89ll0unuGni-gSYAOT7scjE4mwai,1J2I5fpmJDlT63fS4gMeazGDrQ7e5kPQS
Programación I|~1dvgtF0rwbI29OM7SZ5Pqp5hbZ9dvq-c7,1WaSKySI1oXm52afMcmw7vRbnOkUVsRrj
Fundamentos de Electrónica|~1IRJTV8NbKSBiq28y3MZXmSGxO5QYtBnr,1CiQY1fBJPfzRVdJQBD0-QUntQ
Matemática Discreta|~14fGcAkPzLQDIj13UHgbra8Q35-YOtgQa
Estadística Aplicada|11dJhqLGr4XdrEKCMO5y3s_Y3zmurqiFo
Sistemas Complejos|1ETofFXSjUNcDUQs6TwkZw0dSqflSc8eU
Diseño Mecánico I|1T1YK0lf8w7XOs7HvzN29O7QYTjPWg2qo
Diseño Mecánico II|1d2PKSbmPGZiR2rQryis7HTBGxPHFsJGv
Laboratorio de Diseño Mecánico|1Ay3zl1VdRU6sM-_BCIzrFShqXdzEGOnD
Histología y Anatomía|1Frck86l5yB1YwOccMYFn9HU80fk5A1lU
Biología Molecular y Celular|1kUPrluQI4E7cB-POI9iQrBBkeLzh6hIX
Probabilidad|1XGRoAb--isaBXVZc-a2gLLH_x4wPNLhY
Mecánica de Sólidos|1PGXANEFPvirrTcjOxcgFkoxk80kQsE93
Termodinámica|1DFmxbENrdRlFX-HR5XgFB_WQAB2BQEof,1HdrmRcT_syqyJuOdpYmzbiMgl5tXm5Jf
Métodos Numéricos|1z_BHYHxDSnhGhpquHqf8oz7y_TiO7h9b,1ecTrFLupYZ_CbtcA2kHXWdIuFznxhS9W
Estructura de Datos y Programación|16pcdGfYVHK4RBM6IGs3OVU1IxDFEfsot
Electrotecnia|1tz9CQjdZdIPPCMl94Vu4tHjb6V37THvW,1I7j-7onyyI6svgbgG3KV06YKA7rPxZQX
Probabilidad y Estadística|1T70uJD1kdcswa18HP0tw7UXP0h1v0l8W,1HkwPUEBtd1AX7J-kMuEYknx7OEyuEFYo
Metodología del Diseño|1HDP3hrOZdwa4d0QnoxMinwQr25kfOyNY,1IcffzDSwG3y8zNdJsGDv8BQhJKSDAMM0
Química Orgánica I|1-ieycG9yBTWI6um_MlUXucudGX0cz8A0
Química Orgánica II|1HrDoR7gaqUeKG_KkNp1t_oh-jLV7usxo
Química Inorgánica|1F--sLCEUWHMiS0GgVYYVGyi1aRimByhh
Química Analítica|1H5pCYoTACpszxjKMa_aS5Q3rVgmTvyIv
Química-Física|1IYbmDjRd4F7xgpMjHEQP7E6xBgkcRV8I
Bioquímica y Microbiología Aplicadas|1ucmi2B8TAA9kTchlJzA9hDP1QvPwQxuI
Materiales para la Industria Química|1lfbuCWPbJbZQz2mdr2hZYV3Xattl3y08
Fenómenos de Transporte|1JtxJ4LxQumHb-y-PUR6HcsapGFuaeiMk
Procesos Industriales|1Pw8EuGczNIYIeVgA5HjXYjEOhoSpW4P6
Instalaciones Mecánicas en Plantas de Proceso|1SqdYylhbNyVL0FAwlH3Dv2uUXVSJhRms
Matemática (Ingreso)|1jd7t3KQfb0_umFeXm-_O5wd1rPn8ubsJ,1-AsDvoxHEVviFks_D1c6GiCGUmn3Svks,1c3xMzN71WhdEsVPlbEKCFB47pndLabl1,1w4NaiSGkdlwgniGsI-UTwnuD83M2L-jl
Física (Ingreso)|1s0FYnekXR_iYyCuYm7xjr-2cy9YoTen7,1-sFxut7pNg88DsPDBVraN1jeYUHtTbFz,1c_ceofjlWFmvtKyM_gIcx22gf5i1iPUp
Química (Ingreso)|1tp21KhysTyAImKqY8ElvpsdFvWH6GtIU,1-8QmINsJ6o13KEgrhHJl72ou3m1WpflH`.split("\n").forEach((l) => { const [n, ids] = l.split("|"); DRV[norm(n)] = ids.split(","); });
const link = (id: string) => id[0] === "~" ? `https://drive.google.com/file/d/${id.slice(1)}/view` : `https://drive.google.com/drive/folders/${id}`;
const CAREERS = `Ingreso|Matemática (Ingreso)/Física (Ingreso)/Química (Ingreso)/Tecnología (Ingreso)/Pensamiento y lenguaje (Ingreso)#
Ing. en Biotecnología|Análisis Matemático I/Álgebra lineal/Informática General/Química General/Tecnología y Sociedad#Análisis Matemático II/Sistemas de Representación/Fundamentos de Química Orgánica/Física I/Biología/Inglés I/Introducción a la Biotecnología;Análisis Matemático III/Química Analítica/Física II/Bioquímica y Microbiología Aplicadas#Análisis Matemático IV/Probabilidad y Estadística/Química-Física/Biología Molecular y Celular/Inglés II;Métodos Numéricos/Metodología del Diseño/Fenómenos de Transporte/Termodinámica/Fisiología y Genética de Microorganismos#Sistemas de Control/Operaciones Unitarias I/Bioprocesos/Proyecto interdisciplinario/Organización Industrial;Calidad de Organizaciones/Separaciones Biotecnológicas/Biodepuraciones y Biorremediación/Ingeniería Genética/Análisis de Coyuntura Económica/Derecho para ingenieros#Gestión de Proyectos/Introducción a las Finanzas/Seguridad Ocupacional y Ambiental;Proyecto Final de Carrera#Proyecto Final de Carrera/Práctica Profesional Supervisada
Ing. Química|Química General/Informática General/Análisis Matemático I/Álgebra Lineal/Tecnología y Sociedad#Química Inorgánica/Introducción a la Ingeniería Química/Sistemas de Representación/Certificaciones tecnológicas/Análisis Matemático II/Física I;Química Orgánica I/Biología/Procesos Industriales/Análisis Matemático III/Física II#Química Orgánica II/Análisis Matemático IV/Métodos Numéricos/Probabilidad y Estadística/Física III;Química Analíticaa/Química-Física/Bioquímica y Microbiología Aplicadas/Materiales para la Industria Química/Metodología del Diseño#Termodinámica/Fenómenos de Transporte/Electrotecnia/Instalaciones Mecánicas en Plantas de Proceso/Proyecto Interdisciplinario;Operaciones Unitarias I/Operaciones Unitarias II/Ingeniería de Reacciones y Reactores I/Derecho para Ingenieros#Operaciones Unitarias III/Ingeniería de Reacciones y Reactores II/Simulación de Procesos/Control de Procesos;Organización Industrial/Diseño Conceptual de Procesos/Proyecto Final de Carrera I/Análisis de Coyuntura Económica#Gestión de la Salud y la Seguridad en el Trabajo/Proyecto Final de Carrera II/Introducción a la Ingeniería Ambiental/Introducción a las Finanzas/Practica Profesional supervisada
Ing. Naval|Química General/Informática General/Análisis Matemático I/Álgebra Lineal/Tecnología y Sociedad#Ciencia de Materiales I/Sistemas de Representación/Introducción a la Ing. Naval/Certificaciones tecnológicas/Análisis Matemático II/Física I;Biología/Diseño Mecánico I/Estructura de Datos y Programación/Análisis Matemático III/Física II#Diseño Mecánico II/Termodinámica/Análisis Matemático IV/Métodos Numéricos/Física III;Ciencia de Materiales II/Diseño Mecánico III A/Diseño Mecánico III B/Hidrostática y Estabilidad/Física IV/Metodología del Diseño#Electrotecnia/Mecánica de Fluidos/Resistencia y Propulsión/Probabilidad y Estadística/Proyecto Interdisciplinario;Organización Industrial/Electrónica e Instrumentación/Máquinas Térmicas e Hidráulicas/Construcción Naval/Análisis de Coyuntura Económica#Seguridad Ocupacional y Ambiental/Diseño Mecánico IV/Motores Marinos/Alistamiento Naval/Derecho para Ingenieros;Estructura de Buques/Plantas Propulsoras Marinas/Proyecto de Buques#Astilleros y Mantenimiento de Buques/Práctica de Embarque/Proyecto de Embarcaciones de Trabajo/Proyecto Final (Anual)/Practica Profesional supervisada
Ing. Mecánica|Química General/Informática General/Análisis Matemático I/Álgebra Lineal/Tecnología y Sociedad#Biología/Ciencia de Materiales I/Introducción a la Ingeniería Mecánica/Sistemas de Representación/Certificaciones tecnológicas/Análisis Matemático II/Física I;Diseño Mecánico I/Laboratorio de Diseño Mecánico/Estructura de Datos y Programación/Análisis Matemático III/Física II#Diseño Mecánico II/Termodinámica/Análisis Matemático IV/Métodos Numéricos/Física III;Electrotecnia/Ciencia de Materiales II/Diseño Mecánico III A/Diseño Mecánico III B/Física IV/Metodología del Diseño#Diseño Mecánico IV/Termofluidos I/Probabilidad y Estadística/Proyecto Interdisciplinario;Organización Industrial/Electrónica e Instrumentación/Termofluidos II/Instalaciones Industriales/Análisis de Coyuntura Económica/Derecho para Ingenieros#Seguridad Ocupacional y Ambiental/Sistemas de Control/Mantenimiento Industrial/Máquinas Térmicas e Hidráulicas/Introducción a las Finanzas;Proyecto Final (Anual)#Practica Profesional supervisada
Ing. Informática|Sistemas de Representación/Introducción a la Informática/Análisis Matemático I/Álgebra/Metodología del Aprendizaje#Programación Imperativa/Análisis Matemático II/Física I/Matemática Discreta;Química/Diseño y Procesamiento de Documentos XML/Programación Orientada a Objetos/Lógica Computacional/Física II#Arquitectura de Computadoras/Estructura de Datos y Algoritmos/Probabilidad y Estadística/Física III;Sistemas Operativos/Ingeniería de Software I/Interacción Hombre-Computadora (HCI)/Base de Datos I#Protocolos de Comunicación/Proyecto de Aplicaciones Web/Autómatas, Teoría de Lenguaje y Compiladores/Métodos Numéricos/Formación General I/Inglés I;Economía para Ingenieros/Derecho para Ingenieros/Ingeniería del Software II/Base de Datos II/Programación de Objetos Distribuidos/Métodos Numéricos Avanzados#Simulación de Sistemas/Sistemas de Inteligencia Artificial/Gestión de Proyectos Informáticos/Criptografía y Seguridad;Seguridad Ocupacional y Ambiental/Redes de Información/Proyecto Final/Diseñá tu perfil, definí tu futuro#Práctica Laboral/Formación General III/Inglés II/Inteligencia Artificial
Ing. Industrial|Química General/Informática General/Análisis Matemático I/Álgebra Lineal/Tecnología y Sociedad#Biología/Sistemas de Representación/Gestión de Datos/Análisis Matemático II/Física I;Mecánica de Sólidos/Análisis Matemático III/Probabilidad/Física II#Sistemas Complejos/Estadística Aplicada/Mecánica de Fluidos/Análisis Matemático IV/Métodos Numéricos/Física III;Organización de la Producción I/Materiales y Procesos/Principios y Aplicaciones Eléctricas/Física IV/Metodología del Diseño#Supply Chain/Investigación Operativa/Termodinámica y sus aplicaciones/Proyecto Interdisciplinario;Tecnologías y Procesos de Producción/Electrónica e Instrumentación/Economía Empresaria/Certificaciones tecnológicas/Inglés I#Gestión Ambiental/Simulación/Economía/Derecho para Ingenieros;Proyecto Final de Ingeniería Industrial (Anual)#Inglés II/Práctica Profesional supervisada
Lic. en Negocios y Tecnología|Informática General/Introducción a la tecnología informática/Certificaciones tecnológicas/Introducción a la Administración/Sistemas Contables/Álgebra#Programación web/Contabilidad Gerencial/Negocios en Internet/Análisis Matemático/Panorama Histórico Global/Filosofía;Gestión Financiera/Microeconomía/Gestión de Datos/Comercialización/Estadística#Macroeconomía/Derecho Público y Privado I/Gestión organizacional basada en procesos de negocio/Análisis funcional de aplicaciones informáticas/Epistemología y Heurística/Prácticas Expositivas;Toma de Decisiones/Impuestos para la toma de decisiones I/Arquitectura de soluciones digitales/Estructura de las Organizaciones#Gestión de Operaciones/Gestión de Ventas/Impuestos para la toma de decisiones II/Sistemas Integrados de Gestión I/Administración de Recursos Humanos;Arquitectura empresarial/Estrategia Empresarial/Diseñá tu perfil, definí tu futuro.#
Ing. Electrónica|Química General/Principios de Informática/Análisis Matemático I/Álgebra Lineal/Tecnología y Sociedad#Fundamentos de Electrónica/Programación I/Sistemas de Representación/Análisis Matemático II/Física I;Algoritmos y Estructuras de Datos/Análisis Matemático III/Matemática Discreta/Probabilidad y Estadística/Física II#Biología/Teoría de Circuitos/Análisis Matemático IV/Métodos Numéricos/Física III;Tecnología de Materiales Electrónicos/Laboratorio de Electrónica I/Física Electrónica/Análisis Matemático V/Física IV/Metodología del Diseño#Teoría de Circuitos II/Electrónica I/Laboratorio de Electrónica II/Electrónica II/Proyecto Interdisciplinario;Análisis de Señales y Sistemas Digitales/Electrónica III/Electromagnetismo/Sistemas de Control/Laboratorio de Electrónica III#Organización Industrial/Transmisión de la Información/Sistemas Embebidos/Electrónica IV/Análisis de Coyuntura Económica;Seguridad Ocupacional y Ambiental/Electrónica V/Proyectos Electrónicos/Proyecto Integrador (anual)/Introducción a las Finanzas#Derecho para Ingenieros/Practica Profesional supervisada
Ing. Civil|Química General/Informática General/Análisis Matemático I/Algebra Lineal/Tecnología y Sociedad#Biología/Sistemas de Representación/Introducción a la temática social/Certificaciones Tecnológicas/Análisis Matemático II/Física I;Estática/Análisis Matemático III/Probabilidad y Estadística/Física II#Mecánica de Fluidos/Tecnología de materiales/Resistencia de Materiales/Física III;Organización Industrial/Tecnología del Hormigón/Construcciones/Análisis Estructural/Métodos Numéricos/Metodología del Diseño#Geología I/Geotopografía/Instalaciones/Hormigón I/Proyecto Interdisciplinario;Análisis de Coyuntura Económica/Derecho para Ingenieros/Evaluación de Impacto Ambiental y Social/Geotecnia/Hidrología y obras hidráulicas#Hormigón II/Planeamiento territorial y urbano/Vías de Comunicación/Higiene y Seguridad en Obras Civiles;Agua y Efluentes Líquidos/Proyecto Final/Cimentaciones/Estructuras Metálicas y de Madera/Organización y conducción de obras/Auditorías ambientales#Practica Profesional supervisada
Bioingeniería|Química General/Informática General/Análisis Matemático I/Álgebra Lineal/Tecnología y Sociedad#Fundamentos de Química Orgánica/Biología/Sistemas de Representación/Análisis Matemático II/Física I;Biología Molecular y Celular/Estructura de Datos y Programación/Análisis Matemático III/Física II#Histología y Anatomía/Análisis Matemático IV/Probabilidad y Estadística/Física III;Fisiología/Mecánica de Biomateriales y Tejidos/Electrotecnia/Física IV/Metodología del Diseño#Ingeniería en Rehabilitación/Física Médica/Señales y Sistemas/Electrónica Analógica y Digital/Métodos Numéricos/Proyecto interdisciplinario;Organización Industrial/Instrumentación Biomédica I/Procesamiento de Señales e Imágenes Biomédicas/Sistemas de Control/Análisis de Coyuntura Económica#Seguridad Ocupacional y Ambiental/Instrumentación Biomédica II/Ingeniería Clínica/Introducción a las Finanzas/Derecho para Ingenieros;Proyecto Final de Carrera (Anual)#Practica Profesional supervisada
Lic. en Analítica (Data Science)|Utilitarios en Informática/Introducción a la Administración/Análisis Matemático/Álgebra#Informática General/Matemática Aplicada/Matemática Discreta/Metodología del Aprendizaje/Panorama Histórico Global;Microeconomía/Estructura de Datos y Programación/Probabilidad/Filosofía/Ética en los Negocios#Estadística Aplicada/Gestión de Datos/Visualización de Información/Estructura de las Organizaciones;Macroeconomía/Derecho Público y Privado I/Proyecto I/Gestión del Ciclo de Vida de la Información/Analítica Descriptiva#Investigación de Operaciones I/Análisis Predictivo;Investigación de Operaciones II#Simulación/Proyecto Final - Analítica
Lic. en Ciencias del Comportamiento|Tecnología y Sociedad/Álgebra/Fundamentos del comportamiento humano/Filosofía de la mente/Análisis Matemático#Informática General/Psicología cognitiva/Matemática aplicada/Neurofisiología y Neuroanatomía/Introducción a la economía;Probabilidad/Psicología del desarrollo/Economía del comportamiento/Gestión de Datos/Sistemas Complejos#Lenguaje y cognición/Estadística aplicada/Cerebro y Neurociencia cognitiva/Metodología de la investigación en ciencias del comportamiento;Gestión de proyectos de innovación y transformación/Sistemas de inteligencia artificial/Neurotecnología/Analítica descriptiva/Ética profesional#Análisis predictivo/Neurociencia aplicada al comportamiento del consumidor/Antropología cognitiva (Comportamiento social y cultural)/Analítica del comportamiento (medición y evaluación de la conducta);Sistemas Sociotécnicos Adaptativos/Técnicas de modificación del comportamiento/Proyecto final I#Cognición afectiva y motivacional/Proyecto Final II
Ing. en Petróleo|Química General/Informática General/Análisis Matemático I/Álgebra Lineal/Tecnología y Sociedad#Química Orgánica para Petróleo/Sistemas de Representación/Introducción a la Ingeniería en Petróleo/Análisis Matemático II/Física I;Estructura de Datos y Programación/Análisis Matemático III/Probabilidad y Estadística/Física II#Biología/Estática y Resistencia de Materiales/Geología I/Análisis Matemático IV/Métodos Numéricos/Física III;Electrotecnia/Termodinámica/Mecánica de Fluidos/Geofísica de Reservorios/Física IV/Metodología del Diseño#Organización Industrial/Seguridad Ocupacional y Ambiental/Máquinas Eléctricas/Introducción a Mecánica de Rocas/Petrofísica y Fluidos de Reservorio/Ingeniería de Perforación I/Proyecto Interdisciplinario;Geología II/Registros de Pozo I/Análisis de Transientes de Presión/Ingeniería de Reservorios/Ingeniería de Workover I/Instalaciones de Superficie/Certificaciones tecnológicas#Gas y Gasolina Natural/Ingeniería de Producción I/Gestión Ambiental en la Industria/Evaluación de Proyectos/Análisis de Coyuntura Económica;Transporte y Cadena de Valor de los Hidrocarburos/Desarrollo de Yacimientos/Introducción a las Finanzas/Derecho para Ingenieros#Práctica de Campo/Práctica de Campo/Industrialización y Economía de los Hidrocarburos`.split("\n").map((l) => { const [name, y] = l.split("|"); return { name, years: y.split(";").map((x) => x.split("#").map((q) => (q ? q.split("/") : []))) }; });
const F = (id: string) => `https://drive.google.com/drive/folders/${id}`, P = (id: string) => `https://drive.google.com/file/d/${id}/view`;
const SEED: Record<string, { t: string; u: string }[]> = {
  "Análisis Matemático I|Apuntes": [{ t: "Teoría Análisis (PDF)", u: P("1RhpRjFXY2gv0thBb8FbHY75Hq19bMyeH") }, { t: "Derivadas notables (PDF)", u: P("17czGelMXZgOChXnzPXl0RMEEKKK2lPlA") }, { t: "Resúmenes de las clases", u: F("1ngcoTE16y56jejX2XeKSok5hT8pWJy9c") }, { t: "Guías", u: F("10s_pgXEiPW9KPHhNjEE6S4W12tkeSrI3") }],
  "Análisis Matemático I|Ex-1P": [{ t: "Carpeta Primer Parcial", u: F("18s3e-oKCXRD9VGSH_P0WzJJEQ9M5vGWV") }],
  "Análisis Matemático I|Ex-2P": [{ t: "Carpeta Segundo Parcial", u: F("1Ozfz3nerkjNk8Bau_NSehkVSoD5dwzTF") }],
  "Análisis Matemático I|Ex-F": [{ t: "Carpeta Finales", u: F("1l59F58I0BdWBZoFc5ggX1O4HjBrN3U-O") }],
  "Análisis Matemático I|Libros": [{ t: "Cálculo — James Stewart, 7.ª ed. (PDF)", u: P("1_toYx49HERYx_PAWLZljBjOC06Kf6xZe") }],
  "Matemática (Ingreso)|Apuntes": [{ t: "Recta y plano (PDF)", u: P("1fbIglClckPwICcTr9Pkzm-WWIhebpLMT") }],
  "Matemática (Ingreso)|Ex-1P": [{ t: "Carpeta Primer Parcial", u: F("1UO1ep11g7mhXIF7jsJYNnvn8SpoPeg18") }, { t: "Parcialitos", u: F("1TdhkYOyDm6WeoA71OZuff0bAw3eyxavQ") }],
  "Matemática (Ingreso)|Ex-2P": [{ t: "Carpeta Segundo Parcial", u: F("1U1Zkmo-QDQ8BoFjikgLeLZpH1qrBmApH") }],
  "Matemática (Ingreso)|Ex-F": [{ t: "Carpeta Finales", u: F("1a3EmkqbLBYlzdXHy4D_iotSLw8ONN8gG") }],
  "Física (Ingreso)|Ex-1P": [{ t: "Parcialitos", u: F("1JPQ-WlajFlPuJGk09CipRud2YM7Pzasq") }],
  "Química (Ingreso)|Apuntes": [{ t: "Teoría", u: F("17-P0ajw_2aORloGWqJ8gWT4fTOQqOG3o") }, { t: "Tabla periódica — guía (PDF)", u: P("1qwrXOGEZJMhdkTEZFBFMkt2o9nqJMgiD") }, { t: "Tabla de nomenclatura orgánica (Word)", u: P("1sv9kLi6YK9VncX5zOrlwLBRwi5V3Zhto") }, { t: "Tabla orgánica (Word)", u: P("1eMW2RRwrZ_BK4nd_7YkYkEAeGJ-fofoR") }, { t: "Tabla de nomenclaturas (Word)", u: P("1st7ogZ1GzDB-QuJyVii847JfPVcCfGgJ") }],
  "Química (Ingreso)|Ex-1P": [{ t: "Parcialitos", u: F("1FBnoddaPKpP8uHt03Eum6Y6MXD9JDDKS") }, { t: "Repaso de parciales", u: F("111gJv5qFcJyqmA4ucJpI0LFvTxk4M6zc") }],
  "Química (Ingreso)|Ex-2P": [{ t: "Carpeta 2.º parcial", u: F("1V78C1EQFKPNoMqUo70NAyPJOqQqHmBIs") }],
  "Química (Ingreso)|Libros": [{ t: "Química — Whitten, 10.ª ed. (PDF)", u: P("1kjqq7PDLDN-HwA3ohtJA2YS-Hrcc003b") }],
};
Object.keys(SEED).filter((k) => /\(Ingreso\)\|Ex-/.test(k)).forEach((k) => { const n = k.split("|")[0] + "|Hitos"; SEED[n] = [...(SEED[n] || []), ...SEED[k]]; delete SEED[k]; });
const FILES = `Análisis Matemático II|Apuntes|1oXY491XUOfvfrgWEWsHoQhoPWJNIShrD:Teoría Análisis II (U1-4)¦D:1XVITdZ2CQfVUW77_8md3MgRZ11yWjS2nCbj0_UBSaig:Famosos 1er parcial¦S:1sv9UuEmTOmdmO6qL97TNCuQarhOVkzZdrs8ZgWXyU2c:Tabla análisis cualitativo¦1L6_t3NsbAkr4Gji2RUrgb2I_bGNPerfg:Resumen 1 · Sucesiones¦1L7WoEsV_KXDrSOQy7VQZD6jZkTNcQAqL:Resumen 2 · Series numéricas¦1LHVzpJ2xjuTt0cWm0BbxU58Z-lfivoKC:Resumen 3 · Series de potencias¦1LI-U_miSxLdUV1e5vpLD8ISVlIGyX53I:Resumen 4 · EDOs de orden 1¦1LMEaWQlE8DickPfpfmxscugNsiLX6JaY:Resumen 5 · EDOs de orden superior¦1LNqLaJ3QmrFX-v4CrabVCcahytWeKN0g:Resumen 6 · Sistemas lineales¦1LT8rV-XRTAhw8iFMeB30amIS4MD7aT0w:Resumen 7 · Análisis cualitativo¦1bSHClL2IUpD2K4V2W1GWL70NC_JlUTgN:Teórica 1 · Sucesiones y series¦1-_ZgF_JUeQbzsbYP9TUGK8I5Yjz4jgAC:Teórica 2 · EDO orden 1¦1jS90iMQbvrrLsuU7ayRIms8L2YHtbROe:Teórica 3 · Wronskiano¦1N6-wF8jMXxJot2GZ1-PbKlajE9dC-lm7:Teórica 4 · EDO orden superior¦1_mNtdsI_AZPU1Wv4gbeKutH7tmTWoNSI:Teórica 5 · Sistemas de ecuaciones diferenciales lineales¦1UZVHEehIpAOlTZTaRbXg0fYSff4P67U7:Teórica 6 · ED cualitativo¦1-WSFqP33wspBD6EYAxxDlCPtdPYw-KCa:Apunte EDO orden superior¦1HvCC10TxeMqb5hJVps76cmMjtX5dCOws:Práctica 1 · Sucesiones¦1ZuZd0E0NpbOBeeBvpd2jfcFz97nXsXV2:Práctica 2 · Series numéricas¦1vo3csRkYmSCtE37lm6VDpiNjamPg8Mck:Práctica 3 · Series funcionales¦1CIDtDAgkJ9lmEg3gVsnvyZsKaQ59quhj:Práctica 4 · EDO¦1l8uNqzgDTRv2JqQMh9yFgYGJL7OUc2Pv:Práctica 5 · EDO superior¦1U0V72hpEjJHbI0X9R96ulnZgKHqlHiUq:Práctica 6 · Sistemas EDO¦1_p12o5Wi9ZTsm3rUCKG8JtIePcbPOf8Q:Práctica 7 · ED cualitativo¦1_BMgKchayNc1FvAXpz7zIMQNSOaDVqFI:Guía 3 resuelta (desde el ej. 3)
Análisis Matemático II|Libros|10ukobGVQx5ANgiEUEFzww_uECY2XrKuc:Calculus Vol. 1, 2.ª ed. — Apostol¦1X9T43udfI3fscT02RFMKlEZ29inYGnvG:Ecuaciones diferenciales con aplicaciones de modelado, 9.ª ed. — Zill
Análisis Matemático II|Ex-1P|1rl6-iq5kF4vs8EbwtjvLLMASxud1Y6Kn:2026 2C¦1PITmuvEsKoMqWGMwuEWjNQPkD98S_ofu:2026 1C · fecha especial¦1634l8Ma1iYE5J6Egx8JvNdFb3qEYTKxI:2026 1C · recu¦1-MTqrA3vStk3xJLdXJB74lptjv3smtVq:2026 1C¦1rAeCx3ta_ZH18YTeZaUsHjGghIYWwQe-:2025 2C · recu¦16UrlKjH_ADQBVyD071tTWY2bS9PbOxRj:2025 2C · resolución¦19JMnyy4bUFPfjywJ4KROc4l-hUFM5xIg:2025 1C · recu¦1cD36o5ZHlXcs6hySdxN_AYXOsvXzMXFn:2025 1C¦1Clbcc_R9a9KcRwxhUHUUmq9WZ6IGtITe:2025 1C · sin resolver¦163Ptcwp9rS08_ATuiY-u-ZuodigongWd:2024 2C · recu¦1QtmCJ-kI5rTiVSZfo_bYB9zFfPj1285i:2024 2C · recu 9-12¦1ExMzwiQ3fSUo-xOYvtFIewD77PH0mE8K:2024 2C¦1Zd01wj4TOHLPjLZuMlmGT3RpfcPWW00v:2024 1C · recu¦1FkYl8uI-ARbpqCxqMLUWJJTX1UFS90Z8:2024 1C¦106qVKyEaXNycGm6u5uYIkotPhReJFMxg:2023 2C · recu¦1L2BEQDbNoW6aH8Q0NjYM6XTivNsZyfIX:2023 2C¦1_wIZvtz6gyEG4tpAvf4LGM8VBuXTzy8q:2023 1C · recu¦1cxIdJFPVyF6qW2BJs8dMgSEhE1WSIMAv:2023 1C¦15hKgR9-EVgDnPvfCL3tTDRK6uzr2-p1a:Ejercicios de parcial
Análisis Matemático II|Ex-2P|1gmrJ8pmdOaqGXXaujPqMLrbIVEPB4sT7:2026 1C¦1olAn-ieiA2fjvUydV0i27WDTRKmTj7ar:2025 2C · recu¦1vJnKflrTmLyBkLKdv_Ipb3AMXES79Nz0:2025 2C¦1baIxYC8YMvFZVePOyj_UUQXjX2f_rf7-:2025 1C · recu¦1SPXap3C2NGMjwXMMEwL2zbAGOcUtm26a:2025 1C¦1-47w_HX5bKQlqf0TB802Fk1Py-Xs4zaU:2025 1C · sin resolver¦1APzwbcfQTM5IA8R16wz1MqMKp875x-Mr:2024 2C · recu¦1lueRiZfSJmGPEYorOudfo6KsGhQWokf8:2024 2C¦1gSDPHcx-fKtDphk0OnvFWo-G-DouxfSn:2024 1C · recu¦19hycAWdi9I7zVQYAFuQH9gQrxNd4VWZw:2024 1C¦1JlXSSsxjPa9K56uaNfkJoYLPktqKzbuz:2023 2C · recu¦1jETORpz7hSafXLrqrqGZb3KAu05QwaBM:2023 2C¦1Mm_J-j58-8nb0dbAkA4Y-3RibBmT-LUD:2019 2C
Análisis Matemático II|Ex-F|1OwqAK72kJ5AVmMDDQ8s3LgMtEuQqY0nJ:2026 Febrero¦1S__Ks19i43bmiMPJ3VN62k3VaIrk5HXy:2025 Febrero¦1OKzmos0nTwdkiLUi_SlJKOEXWWj59rk-:2025 2C · 1.ª fecha¦1qfZ4Ns8FBtjrWap-js9BpHz9-HBlxiP_:2025 1C · 1.ª fecha¦1u_410gIXr4M2AgXsA7g9MA4B1-TER-UI:2024 2C · 1.ª fecha¦1fpF4kAIuiB9cGwyp_SKlkjHCB3KUzSWC:2024 2C · 2.ª fecha¦1qy1sZJHi5G6oaeOfr51IhvsF0VfE6n5Z:2024 1C · 1.ª fecha¦1VTudE4qYlfHqBngHk_mHIejwEqj6l8cV:2024 1C · 2.ª fecha¦1S2zfqkE13j-Od_N4VWktweZMMGFM2UhI:2023 2C · 1.ª fecha¦18W9psos5OXgpE85StLrUWtoN9sp1Nlem:2023 2C · 2.ª fecha
Álgebra Lineal|Apuntes|1eeJ3HSJtCdC0R9K9GHPQQz5BrZ59b15-:Teoría de Álgebra¦1AZIN-J904TlLHe8AE8OyKG6xVqwVZGt1:Clases de Álgebra¦1bZAXNUDRBAPUmnbe5iZtO_hr12s18IZK:Guía 2 · Espacios vectoriales¦1fKXANxTr4JHRbxKmvjZYh_bI0p1f4ogC:Guía 4 · Autovalores y autovectores
Álgebra Lineal|Libros|1K4IV7keG4mqlOk67olf8CLnuPkW8WJ8o:Álgebra Lineal — Poole
Álgebra Lineal|Ex-1P|1fox9dfmv1ar1UnNcUgymYWImIZ-kpWWw:2024 2C¦171V-2mzrS2eyV1VC-NosjbkbLS9QPta5:2024 1C¦1QYI6Xiljq6ExJa2CnOZy59tKQHVDPVSx:2023 2C¦1VeT8ngeG3cCn2EG8OyQoxUo_-kzHjoH4:2023 2C · recu¦1AMrKbxmbsY7IOmIe7JNBTQ9l1jjWBHrt:2023 1C¦158b1JEXUaIGnBBHd8WW-XaQX0PYTs_6G:2023 1C · recu¦1zmZSUmv_ouVZKZRYgC9ptVBvCW6pXo_2:2021 2C¦1sKwmmd3lVLaJMCfjt0CxFdSywpCennOC:2019 2C¦1BHa8GypbScCZ8K3UMztQelZDh8Vdxs3R:2019 1C¦1Dl8S_83IOzc-N7_UO7YH4z3elfDGdB1O:2018 2C¦1pboB1yh7K7k_4LeLyP1RF_toDpy2cfsQ:2016 2C
Álgebra Lineal|Ex-2P|1F0qgk8_-M2DAk3-9yst8f56ltLjIU7j4:2025 1C¦1Dnez-Vm86fj6Ounj5kIoPnO-ytegHS8t:2024 2C¦1x_UzEKnPXDERd2FPcoBjvZuh2IMPAlc5:2023 1C¦1zENbjOvczmSusN98mpPSJzuc588Cfkt9:2022 2C¦1Go3JuSvXL2RCP3CT-iLMPJs6bLo0H0M0:2022 1C¦1ha6aB1-MByexrjJjv4SWgnaOIXpCfN6b:2021 2C¦1dwAOAwnvPflg_A6O3Be8jeHxVttGpv5H:2019 2C¦1EMu0_IecJ8uKLOo4Nrq8wsULBTs58dSj:2019 1C¦1Zoo8olBIZDntgC2T8G6XlJSeho5c6IGC:2018 2C¦1i2XoxCxNMazIFQTsXBylaPOb5kuR7Rx6:2017 1C
Álgebra Lineal|Ex-F|1oBqEphf2tghmL_upRp16Zzu4NShi-_N0:2025 1C · 2.ª fecha¦1QvVJbQcrf0KDgI-1APVFeHaaj2ss81hS:2025 1C · 1.ª fecha¦1ZgHPFUVgGgipsmGpZI6mKVfKp5tDEIXW:2024 1C · 1.ª fecha¦1-QL2hbBrvSQMASRoJuqlcVtkclxLxQi5:2023 2C · 1.ª fecha¦1dqQqkXqbnpn6O1vsM3Q3_-s1ZYAJkWc-:2023 2C · 2.ª fecha¦1knf2Rh8fkh22M0iELhYIF4mSXm4BiOXn:2023 1C · 1.ª fecha¦1uK2ybD17B4fxyzb7I7neU_2SSwDeNcJm:2023 1C · 2.ª fecha¦1YDqO0DO5-PiDCmo-I0i89RUCBNg1ewLB:2022 2C · 1.ª fecha¦1QlrGpO9YgQe8IqcQ2_nDOyK_ttUsqR0j:2022 2C · 2.ª fecha¦1PZlbX8ysiJKRTika_Mq0RIer5oUZvxsr:2022 1C · 2.ª fecha
Química General|Apuntes|1G23lFt716VR4om1oXRXpPbOnrmPgw0Mm:Teoría de Química¦1piffw2T-Zx9q4-woAoYOBeRFN_qc9W1I:Guía de problemas¦1lhmTTAVpv-SSzxEsf_O1UrNPjArWxZYF:Guía de problemas adicionales¦1oBRj_x4HJp3n6fe4g2cBJZ5eq4_naVYh:Cuadro GM¦1zOhZCjGRVrhYZb-i8Isk6MlBNVoxG-Mo:Fórmulas¦1kMxT3BGnAvuWg3tWlX-vrLAXBHDwdP5_:Soluciones Whitten
Química General|Libros|1VjYQCBY2RZyakk-eatRgITjQfBqLjedQ:Química, 10.ª ed. — Whitten¦1v1Ruxmgs8SwqsyconvLpeC5GHI_diox7:Whitten (recortado según el programa)
Informática General|Apuntes|1TtxvM4EUsc6pNfUTVxGMCuqg0BC6Eitq:Teoría de Informática¦1TU1-IRscff_zdEresWvP8FskEzgG3Sbs:Funciones MatLab
Informática General|Libros|1vcyGLwSYCNjdPdr4kl7-f4HI1f4AQb8g:MATLAB: A Practical Introduction to Programming and Problem Solving, 3.ª ed. — Attaway
Física I|Apuntes|1eWAWJYM9bi7UJ43Bf-l9DIltCcYIyf3l:Teoría de Física¦D:1WMOkyatX7oYhA9fiNM9Cov587T536Dz6U0Mx9ntEnKk:Hoja de fórmulas
Física I|Ex-1P|1FIJ0beXjACG8LsMeGdi6mO0-66fcaUbe:2024 2C¦1DqUvoJnQWfp5hthO2lnYioXzlQp8ncH2:2024 1C¦1PpfSaC-t-x0Ru1lKrJ488qQpx0_WNOvo:2023 2C¦1tXlFzfGwGtfMxHc7ram6jOouWqt-pYee:2023 1C¦1s03QkNHc8H4kcnCOJX5VXeEf6gHrN1sK:2022 2C¦19vt3ePBjp0JhJcOca4kw0Kkm9vTCQ3MG:2022 1C¦1RoaLrVIXmOg9jxFwm94czFu1EAxfwo7Z:2021 2C¦1Wa92KBq5FB9BXgNDpjiNe-FuZRpv-CG2:2021 1C¦1fh9E8dGY0ccBIJlPHFOtJGUMG4SBDcRT:2019 2C¦1k8ebdUMSaGWXJJfevgd5SJJgD8_8VmkQ:2019 1C
Física I|Ex-2P|1pq5Pdavp1XoqVtdtRx_jw8oq2jeFa2Za:2024 2C¦1SsXsgnvJCuFm8HY1MG7J7j3W_zH2fwyL:2024 1C¦193lt6oZNZNtSmxqBKx_PjKGIbol1ZdAv:2023 2C¦1SEDKGP9yW-ssb0EfgtQYuRuEn9-ahp3E:2023 1C¦1rc3_W7Ii9DqFgC3psL4ct4puhiUJShdw:2022 1C¦1J2KPn86xdbuKKP3t1xlB4im6zAeMD5d0:2021 1C¦1S9hRjpq_PO_bSMvJYN8Hkfh0HOsvQTw8:2020 2C¦1Fy8z064YknMQ7-XGttiowAQ-aRxfNWDy:2019 2C¦1WNFbJJCauIEwTznQNeaGmxI3VMGMFc5C:2019 1C
Física I|Ex-F|1mmbfMlvwt1cVceJYBnD7AP3GVT6xT3Jb:2025 Febrero¦1Xn5LNxYlgsTS0fBQscHe1qNu03ko89gJ:2025 1C · 1.ª fecha¦1SHaaN7txy6bE7imjX4M-l6AcprQl1LtH:2024 Febrero¦1AmkR38x2TmZeE7F6yvjqCw_8vNKg-rqS:2024 2C · 1.ª fecha¦1EnnELnh18Koik5LPmjH6V6VweUmxQge2:2024 1C · 1.ª fecha¦1ga2q8YBq6n9HNAYF2dDDa20hBD50JpiV:2024 1C · 2.ª fecha¦1ZOUEPnFEsdGllWTGLr1jCNMWuWia6s6I:2023 2C · 2.ª fecha¦1tKbRCYM6galrgm-Sxub-0Vi-jExmQkbZ:Ejercicios de Hidro
Química General|Ex-1P|1vxbbYcnzsfCwKgu7Wbvl6L0EadvMCsW8:2025 2C · Recreación¦17jO-gf1avngYmag2Mujnjzmq6OJ8fgtZ:2025 2C · Informática
Química General|Ex-2P|14NnTapIemxkRqNWUihckhdeQpLZsi6EH:2025 1C
Química General|Ex-F|1xCccpULnfLRV_-qkBmP8xVNHWtxOBNvd:2025 2C · 1.ª fecha`;
const furl = (id: string) => id.startsWith("D:") ? `https://docs.google.com/document/d/${id.slice(2)}/edit` : id.startsWith("S:") ? `https://docs.google.com/spreadsheets/d/${id.slice(2)}/edit` : P(id);
FILES.split("\n").forEach((l) => { const [n, k, body] = l.split("|"); SEED[`${n}|${k}`] = body.split("¦").map((x) => { const i = x.indexOf(":", /^[DS]:/.test(x) ? 2 : 0); return { t: x.slice(i + 1), u: furl(x.slice(0, i)) }; }); });

const SECS = [["Apuntes", "Apuntes"], ["Ex", "Exámenes"], ["Libros", "Libros y materiales"]] as const;
const EXS = [["1P", "Primer parcial"], ["2P", "Segundo parcial"], ["F", "Finales"]] as const;
type Item = { t: string; u: string };
const ASOC = [
  ["CEITBA", "Centro de Estudiantes del ITBA", "La representación estudiantil de la universidad."],
  ["SABF", "South American Business Forum", "Foro de negocios organizado por estudiantes."],
  ["TRAMA", "Acercamos el mundo profesional a los estudiantes", "Un puente entre las empresas y la comunidad estudiantil."],
  ["SPE / EAGE", "Capítulo estudiantil de la Society of Petroleum Engineers", "Para quienes se interesan por petróleo, geociencias y energía."],
  ["CONEXIÓN", "Espíritu solidario e innovador de la comunidad ITBA", "Impulsa iniciativas solidarias e innovadoras."],
  ["IEEE", "Capítulo estudiantil IEEE-ITBA", "La rama estudiantil del Instituto de Ingenieros Eléctricos y Electrónicos."],
  ["TECH TREK", "Conectamos jóvenes con polos tecnológicos del mundo", "Viajes y encuentros con los principales hubs de tecnología."],
  ["ASME", "Capítulo estudiantil de la American Society of Mechanical Engineers", "Para el público de ingeniería mecánica."],
  ["AIChE", "Capítulo estudiantil de Ingeniería Química", "Actividades y encuentros de ingeniería química."],
  ["EMB", "Engineering in Medicine and Biology Society", "Presenta a la comunidad los avances de la bioingeniería."],
  ["TURING", "Capítulo estudiantil de Ciencias de la Computación del ITBA", "Para quienes les apasiona la computación."],
  ["WIE", "IEEE Women in Engineering", "Promueve la participación de las mujeres en la ingeniería."],
  ["SEDS", "Students for the Exploration and Development of Space", "Estudiantes que impulsan la exploración y el desarrollo espacial."],
  ["Computer Society", "IEEE Computer Society ITBA", "Rama estudiantil de la sociedad de computación del IEEE."],
  ["Brainware", "Neurociencias y neurotecnología", "Se dedica a la difusión e investigación en neurociencias y neurotecnología."],
];
const ALL = [...new Set(CAREERS.flatMap((c) => c.years.flat(2)))];

const COL: Record<string, string> = {
  Ingreso: "#2B52A1", "Ing. en Biotecnología": "#4FB06A", "Ing. Química": "#27A59A", "Ing. Naval": "#1B6DA8", "Ing. Mecánica": "#D6452D",
  "Ing. Informática": "#94C11F", "Ing. Industrial": "#F0D800", "Ing. Electrónica": "#1F8FD6", "Ing. Civil": "#8A6A4F", Bioingeniería: "#00A14B",
  "Lic. en Negocios y Tecnología": "#B8398B", "Lic. en Analítica (Data Science)": "#E0832B", "Lic. en Ciencias del Comportamiento": "#7A5BC4", "Ing. en Petróleo": "#3A3F4A",
};
const BLUE = "#2B52A1", NAVY = "#0B2A6B";
const Doc = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /></svg>);
const Search = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>);

export default function App() {
  const [car, setCar] = useState<string | null>(null);
  const [view, setView] = useState<"home" | "asoc">("home");
  const [yr, setYr] = useState(0);
  const [sel, setSel] = useState<string | null>(null);
  const [sec, setSec] = useState("Apuntes");
  const [ex, setEx] = useState("1P");
  const [items, setItems] = useState<Record<string, Item[]>>(SEED);
  const [t, setT] = useState("");
  const [u, setU] = useState("");
  const [pal, setPal] = useState(false);
  const [q, setQ] = useState("");
  const [hi, setHi] = useState(0);
  const inp = useRef<HTMLInputElement>(null);

  const career = CAREERS.find((c) => c.name === car);
  const accent = (car && COL[car]) || BLUE;
  const isIng = !!sel && sel.endsWith("(Ingreso)");
  const disp = (n: string) => n.replace(" (Ingreso)", "");
  const fileCount = (n: string) => Object.entries(items).filter(([k]) => k.startsWith(n + "|")).reduce((a, [, v]) => a + v.length, 0);
  const notes = (n: string) => (items[`${n}|Apuntes`] || []).length > 0;
  const has = (n: string) => !!DRV[norm(n)];
  const total = Object.values(items).reduce((a, v) => a + v.length, 0);
  const top = useMemo(() => [...ALL].map((n) => [n, fileCount(n)] as const).filter((x) => x[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, 6), [items]);
  const found = useMemo(() => (q.trim() ? ALL.filter((n) => norm(n).includes(norm(q))).slice(0, 10) : top.map((x) => x[0])), [q, top]);

  const key = sel ? `${sel}|${sec === "Ex" ? (isIng ? "Hitos" : "Ex-" + ex) : sec}` : "";
  const cur = items[key] || [];
  const add = () => { if (!t.trim() || !/^https?:\/\//.test(u.trim())) return; setItems({ ...items, [key]: [...cur, { t: t.trim(), u: u.trim() }] }); setT(""); setU(""); };

  const go = (c: string | null, v: "home" | "asoc" = "home") => { setCar(c); setSel(null); setView(v); setYr(0); window.scrollTo(0, 0); };
  const open = (n: string, c?: string | null) => { if (c !== undefined) setCar(c); setView("home"); setSel(n); setSec("Apuntes"); setEx("1P"); setPal(false); setQ(""); window.scrollTo(0, 0); };
  const openPal = () => { setPal(true); setHi(0); setTimeout(() => inp.current?.focus(), 30); };

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPal((p) => !p); setHi(0); setTimeout(() => inp.current?.focus(), 30); }
      if (e.key === "Escape") setPal(false);
    };
    addEventListener("keydown", k); return () => removeEventListener("keydown", k);
  }, []);

  const Row = ({ n }: { n: string }) => {
    const c = fileCount(n);
    return (
      <button onClick={() => open(n)} className="w-full flex items-center justify-between gap-3 text-left px-4 py-3 border-b border-[#DCE3F0] last:border-0 hover:bg-[#EEF2F9] focus-visible:bg-[#EEF2F9]">
        <span className="font-medium text-[15px] leading-snug">{disp(n)}</span>
        <span className={`shrink-0 text-xs ${notes(n) ? "text-[#2B52A1] font-semibold" : "text-slate-400"}`}>{notes(n) ? `${c} archivos` : "Sin apuntes subidos"}</span>
      </button>
    );
  };

  const nav = "px-3 py-2 text-[15px] font-medium text-slate-700 hover:text-[#2B52A1] rounded";

  return (
    <div className="min-h-screen bg-white text-[#1B2433]" style={{ fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif" }}>
      <div className="sticky top-0 z-30">
      <div role="note" className="bg-[#FFE98A] text-[#4A3A00] text-[13px] sm:text-sm text-center px-4 py-2 border-b border-[#E6CB5C]"><strong>Página no oficial.</strong> Hecha por estudiantes: no pertenece ni está avalada por el ITBA. Los archivos abren en Google Drive con tu cuenta ITBA.</div>
      <header className="bg-white border-b border-[#DCE3F0]">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center gap-2">
          <button onClick={() => go(null)} className="flex items-center gap-3 mr-4" aria-label="Inicio">
            <span className="grid place-items-center h-9 px-2 text-white font-extrabold tracking-tight text-lg" style={{ background: BLUE, borderRadius: "10px 10px 10px 2px" }}>ITBA</span>
            <span className="hidden sm:block text-[15px] font-semibold text-slate-800">Apuntes</span>
          </button>
          <nav className="hidden md:flex items-center">
            <button className={nav} onClick={() => { go(null); setTimeout(() => document.getElementById("carreras")?.scrollIntoView({ behavior: "smooth" }), 50); }}>Carreras</button>
            <button className={nav} onClick={() => go("Ingreso")}>Ingreso</button>
            <button className={nav} onClick={() => go(null, "asoc")}>Asociaciones estudiantiles</button>
          </nav>
          <button onClick={openPal} className="ml-auto flex items-center gap-2 rounded-full border border-[#C5D0E6] px-4 h-10 text-sm text-slate-500 hover:border-[#2B52A1]">
            <Search /><span className="hidden sm:inline">Buscar materia</span><kbd className="hidden sm:inline rounded bg-[#EEF2F9] px-1.5 py-0.5 text-xs text-slate-500">Ctrl K</kbd>
          </button>
        </div>
      </header>
      </div>

      {!car && !sel && view === "home" && (
        <section className="relative overflow-hidden text-white" style={{ background: BLUE }}>
          <div className="absolute -right-32 -top-32 w-[460px] h-[460px] rounded-full" style={{ background: NAVY }} />
          <div className="absolute right-24 bottom-[-120px] w-[260px] h-[260px] rounded-full border-[18px] border-white/10" />
          <div className="relative max-w-6xl mx-auto px-5 py-16 md:py-24">
            <h1 className="font-extrabold tracking-tight leading-[1.05] text-4xl md:text-6xl max-w-2xl">
              <span className="rise block" style={{ animationDelay: "0ms" }}>Encontrá los apuntes</span>
              <span className="rise inline-block mt-3 px-4 py-1 rounded-2xl" style={{ background: "#94C11F", color: NAVY, animationDelay: "120ms" }}>de tu materia</span>
            </h1>
            <p className="rise mt-6 text-lg text-white/85 max-w-xl" style={{ animationDelay: "240ms" }}>Apuntes, exámenes viejos y libros de cada carrera del ITBA, organizados por año y cuatrimestre.</p>
            <button onClick={openPal} className="rise mt-8 w-full max-w-xl flex items-center gap-3 rounded-full bg-white text-slate-500 px-6 h-14 text-left shadow-lg" style={{ animationDelay: "360ms" }}>
              <Search /><span className="flex-1">Buscar materia, por ejemplo Análisis Matemático II</span><kbd className="hidden sm:inline rounded bg-[#EEF2F9] px-2 py-1 text-xs">Ctrl K</kbd>
            </button>
            <p className="rise mt-5 text-sm text-white/75" style={{ animationDelay: "440ms" }}>{CAREERS.length - 1} carreras, {ALL.length} materias y {total} archivos cargados.</p>
            <div className="rise mt-6 max-w-xl rounded-2xl bg-white/10 border border-white/30 px-5 py-4 text-sm leading-relaxed" style={{ animationDelay: "520ms" }}><strong className="font-bold">Sitio no oficial.</strong> Lo armamos estudiantes para compartir apuntes. No tiene vínculo institucional con el ITBA ni está avalado por la universidad. Los archivos están en Google Drive y se abren con una cuenta ITBA.</div>
          </div>
        </section>
      )}

      <main className="max-w-6xl mx-auto px-5 py-10">
        {view === "asoc" && !car && !sel ? (<>
          <button onClick={() => go(null)} className="text-sm font-medium text-[#2B52A1] mb-4">Volver a los apuntes</button>
          <h1 className="text-4xl font-extrabold tracking-tight">Asociaciones estudiantiles</h1>
          <p className="mt-3 text-slate-600 max-w-2xl">Organizaciones de estudiantes del ITBA con actividades educativas, culturales, solidarias y deportivas. Para sumarte, entrá a <a href="https://estudiantes.itba.edu.ar/asociaciones-estudiantiles/" target="_blank" rel="noreferrer" className="underline text-[#2B52A1]">estudiantes.itba.edu.ar</a> con tu cuenta ITBA.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {ASOC.map(([n, f, d]) => (
              <div key={n} className="rounded-2xl border border-[#DCE3F0] p-5 border-t-[6px]" style={{ borderTopColor: BLUE }}>
                <h2 className="text-xl font-bold">{n}</h2>
                <p className="text-sm font-medium text-[#2B52A1] mt-1">{f}</p>
                <p className="text-sm text-slate-600 mt-3">{d}</p>
              </div>
            ))}
          </div>
        </>) : sel ? (<>
          <nav className="text-sm text-slate-500 mb-5 flex flex-wrap gap-x-2">
            <button onClick={() => go(null)} className="hover:text-[#2B52A1]">Carreras</button><span>/</span>
            {career ? <button onClick={() => setSel(null)} className="hover:text-[#2B52A1]">{career.name}</button> : <span>Búsqueda</span>}<span>/</span>
            <span className="text-slate-800">{disp(sel)}</span>
          </nav>
          <div className="rounded-2xl p-6 md:p-8 bg-[#EEF2F9] border-l-[10px]" style={{ borderLeftColor: accent }}>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{disp(sel)}</h1>
            <p className="mt-2 text-slate-600 text-sm">{career ? career.name : "Materia"}{fileCount(sel) > 0 ? `, ${fileCount(sel)} archivos` : ""}</p>
            {has(sel) && <a href={link(DRV[norm(sel)][0])} target="_blank" rel="noreferrer" className="inline-block mt-3 text-xs text-slate-500 underline">Ver carpeta original en Drive (parte del material aún no cargado)</a>}
          </div>
          <div role="tablist" className="flex gap-1 border-b border-[#DCE3F0] mt-8 overflow-x-auto">
            {SECS.map(([k, l]) => (
              <button key={k} role="tab" aria-selected={sec === k} onClick={() => setSec(k)} className={`px-5 py-3 text-[15px] font-semibold whitespace-nowrap border-b-[3px] -mb-px ${sec === k ? "border-[#2B52A1] text-[#2B52A1]" : "border-transparent text-slate-500 hover:text-slate-800"}`}>{k === "Ex" && isIng ? "Hitos" : l}</button>
            ))}
          </div>
          {sec === "Ex" && !isIng && <div className="flex flex-wrap gap-2 mt-5">{EXS.map(([k, l]) => <button key={k} onClick={() => setEx(k)} className={`rounded-full px-4 py-1.5 text-sm font-medium border ${ex === k ? "bg-[#2B52A1] text-white border-[#2B52A1]" : "border-[#C5D0E6] hover:border-[#2B52A1]"}`}>{l}</button>)}</div>}
          <p className="mt-5 text-sm text-slate-500">Los archivos se abren en Google Drive: iniciá sesión con tu cuenta ITBA.</p>
          <div className="mt-2 rounded-2xl border border-[#DCE3F0] overflow-hidden">
            {cur.length ? cur.map((i, n) => (
              <a key={n} href={i.u} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-3 border-b border-[#DCE3F0] last:border-0 hover:bg-[#EEF2F9] focus-visible:bg-[#EEF2F9]">
                <span className="text-[#2B52A1]"><Doc /></span><span className="flex-1 text-[15px]">{i.t}</span>
              </a>
            )) : <div className="px-5 py-12 text-center"><p className="font-semibold text-slate-700">{sec === "Apuntes" ? "Sin apuntes subidos" : "Todavía no hay material en esta sección"}</p><p className="text-sm text-slate-500 mt-1">Sumá el primero con el formulario de abajo.</p></div>}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <input value={t} onChange={(e) => setT(e.target.value)} placeholder="Título del archivo" className="flex-1 min-w-[160px] rounded-xl border border-[#C5D0E6] px-4 h-11" />
            <input value={u} onChange={(e) => setU(e.target.value)} placeholder="Enlace (https://…)" className="flex-[2] min-w-[200px] rounded-xl border border-[#C5D0E6] px-4 h-11" />
            <button onClick={add} className="rounded-xl px-6 h-11 font-semibold text-white" style={{ background: BLUE }}>Agregar enlace</button>
          </div>
        </>) : career ? (<>
          <button onClick={() => go(null)} className="text-sm font-medium text-[#2B52A1] mb-4">Todas las carreras</button>
          <div className="rounded-2xl p-6 md:p-8 bg-[#EEF2F9] border-l-[10px]" style={{ borderLeftColor: accent }}>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">{career.name}</h1>
            <p className="mt-2 text-slate-600">{career.name === "Ingreso" ? `${career.years.flat(2).length} materias de ingreso` : `${career.years.length} años, ${career.years.flat(2).length} materias`}</p>
          </div>
          {career.name !== "Ingreso" && (
            <div role="tablist" className="flex gap-2 mt-8 overflow-x-auto pb-1">
              {career.years.map((_, i) => <button key={i} role="tab" aria-selected={yr === i} onClick={() => setYr(i)} className={`rounded-full px-5 py-2 text-[15px] font-semibold whitespace-nowrap border ${yr === i ? "text-white border-transparent" : "border-[#C5D0E6] hover:border-[#2B52A1]"}`} style={yr === i ? { background: BLUE } : {}}>{i + 1}.º año</button>)}
            </div>
          )}
          <div className={`mt-6 grid gap-5 ${career.name === "Ingreso" ? "max-w-xl" : "md:grid-cols-2"}`}>
            {(career.name === "Ingreso" ? [career.years[0][0]] : career.years[yr]).map((ys, j) => (
              <section key={j} className="rounded-2xl border border-[#DCE3F0] overflow-hidden self-start">
                <h2 className="px-4 py-3 font-bold bg-[#EEF2F9] border-b border-[#DCE3F0]">{career.name === "Ingreso" ? "Materias de ingreso" : `${j + 1}.${j === 0 ? "er" : "º"} cuatrimestre`}</h2>
                {ys.length ? ys.map((n) => <Row key={n} n={n} />) : <p className="px-4 py-6 text-sm text-slate-400">Sin materias obligatorias en este cuatrimestre.</p>}
              </section>
            ))}
          </div>
        </>) : (<>
          <section id="carreras" className="scroll-mt-24">
            <h2 className="text-3xl font-extrabold tracking-tight">Elegí tu carrera</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {CAREERS.map((c) => (
                <button key={c.name} onClick={() => go(c.name)} className="group text-left rounded-2xl border border-[#DCE3F0] p-5 border-l-[8px] hover:shadow-md focus-visible:shadow-md bg-white" style={{ borderLeftColor: COL[c.name] }}>
                  <span className="block text-lg font-bold leading-snug">{c.name}</span>
                  <span className="block text-sm text-slate-500 mt-1">{c.name === "Ingreso" ? "Matemática, Física, Química y más" : `${c.years.length} años, ${c.years.flat(2).length} materias`}</span>
                  <span className="block text-xs text-slate-500 mt-3">{c.years.flat(2).filter(notes).length} con apuntes</span>
                </button>
              ))}
            </div>
          </section>
          {top.length > 0 && (
            <section className="mt-14">
              <h2 className="text-3xl font-extrabold tracking-tight">Materias con más material</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {top.map(([n, c]) => (
                  <button key={n} onClick={() => open(n, null)} className="flex items-center justify-between gap-3 text-left rounded-2xl bg-[#EEF2F9] px-5 py-4 hover:bg-[#E1E8F5]">
                    <span className="font-semibold">{disp(n)}</span><span className="text-sm font-bold text-[#2B52A1] whitespace-nowrap">{c} archivos</span>
                  </button>
                ))}
              </div>
            </section>
          )}
          <section className="mt-14 rounded-3xl p-8 md:p-10 text-white flex flex-wrap items-center justify-between gap-4" style={{ background: NAVY }}>
            <div className="max-w-xl"><h2 className="text-2xl font-extrabold">Asociaciones estudiantiles</h2><p className="mt-2 text-white/80">Conocé las organizaciones de estudiantes del ITBA y sumate a la que más te interese.</p></div>
            <button onClick={() => go(null, "asoc")} className="rounded-full px-6 h-12 font-semibold" style={{ background: "#94C11F", color: NAVY }}>Ver asociaciones</button>
          </section>
        </>)}
      </main>

      <footer className="mt-10 text-white" style={{ background: NAVY }}>
        <div className="max-w-6xl mx-auto px-5 py-10 grid gap-8 md:grid-cols-3">
          <div><span className="inline-grid place-items-center h-9 px-2 font-extrabold text-lg bg-white" style={{ color: BLUE, borderRadius: "10px 10px 10px 2px" }}>ITBA</span><p className="mt-3 text-sm text-white/70 max-w-xs">Sitio no oficial hecho por estudiantes, sin vínculo institucional con el ITBA. Los nombres y marcas pertenecen a sus titulares. Los archivos se abren en Google Drive con una cuenta ITBA.</p></div>
          <div><h3 className="font-bold mb-3">Navegar</h3><div className="flex flex-col gap-2 text-sm text-white/80 items-start"><button onClick={() => go(null)}>Carreras</button><button onClick={() => go("Ingreso")}>Ingreso</button><button onClick={() => go(null, "asoc")}>Asociaciones estudiantiles</button></div></div>
          <div><h3 className="font-bold mb-3">Carpetas de Drive</h3><div className="flex flex-wrap gap-2">{DRIVES.map(([n, h]) => <a key={h} href={h} target="_blank" rel="noreferrer" className="rounded-full border border-white/30 px-4 py-1.5 text-sm hover:bg-white/10">{n}</a>)}</div></div>
        </div>
      </footer>

      {pal && (
        <div className="fixed inset-0 z-50 bg-[#0B2A6B]/60 grid place-items-start justify-items-center pt-[12vh] px-4" onClick={() => setPal(false)}>
          <div role="dialog" aria-label="Buscar materia" className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden pop" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-5 h-14 border-b border-[#DCE3F0]"><Search />
              <input ref={inp} value={q} onChange={(e) => { setQ(e.target.value); setHi(0); }} onKeyDown={(e) => { if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => Math.min(h + 1, found.length - 1)); } if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)); } if (e.key === "Enter" && found[hi]) open(found[hi], null); }} placeholder="Buscar materia" className="flex-1 outline-none text-base" />
              <button onClick={() => setPal(false)} className="text-xs text-slate-500 rounded bg-[#EEF2F9] px-2 py-1">Esc</button>
            </div>
            <p className="px-5 pt-3 text-xs font-semibold text-slate-500">{q.trim() ? `${found.length} resultados` : "Materias con más material"}</p>
            <div className="p-2 max-h-[50vh] overflow-y-auto">
              {found.map((n, i) => (
                <button key={n} onMouseEnter={() => setHi(i)} onClick={() => open(n, null)} className={`w-full flex items-center justify-between gap-3 text-left rounded-xl px-3 py-2.5 ${i === hi ? "bg-[#EEF2F9]" : ""}`}>
                  <span className="font-medium">{disp(n)}</span><span className="text-xs text-slate-500">{notes(n) ? `${fileCount(n)} archivos` : "Sin apuntes subidos"}</span>
                </button>
              ))}
              {!found.length && <p className="px-3 py-8 text-center text-sm text-slate-500">No hay materias con ese nombre. Probá con otra palabra.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
