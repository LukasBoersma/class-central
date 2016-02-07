<?php

use Symfony\Component\ClassLoader\ApcClassLoader;
use Symfony\Component\HttpFoundation\Request;

$loader = require_once __DIR__.'/../app/bootstrap.php.cache';
require_once __DIR__.'/../app/AppKernel.php';
$kernel = new AppKernel('prod', false);
$kernel->loadClassCache();
$kernel->boot();

$em = $kernel->getContainer()->get('doctrine')->getManager();

$query = $em->createQuery('SELECT c FROM ClassCentral\SiteBundle\Entity\Course c');
$courses = $query->getResult();

// Output a JSON dump of all selected courses
header('Content-Type: application/json');

echo "[\n";

$first = true;

foreach($courses as $c)
{
    $language = $c->getLanguage();
    if($language)
      $language_code = $language->getCode();

    $initiative = $c->getInitiative();
    if($initiative)
      $initiative_name = $initiative->getName();

    $course_serializable = array(
      'name' => $c->getName(),
      'url' => $c->getUrl(),
      'slug' => $c->getSlug(),
      'short_name' => $c->getShortName(),
      'description' => $c->getDescription(),
      'long_description' => $c->getLongDescription(),
      'syllabus' => $c->getSyllabus(),
      'initiative' => $initiative_name,
      'thumbnail' => $c->getThumbnail(),
      'start_date' => date('c', $c->getStartDate()),
      'exact_date_known' => $c->getExactDateKnown(),
      'language' => $language_code,
      'video_intro' => $c->getVideoIntro(),
      'length' => $c->getLength(),
      'certificate' => $c->getCertificate(),
      'verified_certificate' => $c->getVerifiedCertificate(),
      'workload_min' => $c->getWorkloadMin(),
      'workload_max' => $c->getWorkloadMax()
    );

    if($first)
      $first=false;
    else
      echo ",\n";

    echo json_encode($course_serializable);
}

echo "\n]";
