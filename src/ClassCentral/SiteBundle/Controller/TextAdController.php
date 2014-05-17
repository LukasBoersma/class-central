<?php

namespace ClassCentral\SiteBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

use ClassCentral\SiteBundle\Entity\TextAd;
use ClassCentral\SiteBundle\Form\TextAdType;

/**
 * TextAd controller.
 *
 */
class TextAdController extends Controller
{

    /**
     * Lists all TextAd entities.
     *
     */
    public function indexAction()
    {
        $em = $this->getDoctrine()->getManager();

        $entities = $em->getRepository('ClassCentralSiteBundle:TextAd')->findAll();

        return $this->render('ClassCentralSiteBundle:TextAd:index.html.twig', array(
            'entities' => $entities,
        ));
    }



    /**
     * Finds and displays a TextAd entity.
     *
     */
    public function showAction($id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('ClassCentralSiteBundle:TextAd')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find TextAd entity.');
        }

        $deleteForm = $this->createDeleteForm($id);

        return $this->render('ClassCentralSiteBundle:TextAd:show.html.twig', array(
            'entity'      => $entity,
            'delete_form' => $deleteForm->createView(),        ));
    }

    /**
     * Displays a form to edit an existing TextAd entity.
     *
     */
    public function editAction($id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('ClassCentralSiteBundle:TextAd')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find TextAd entity.');
        }

        $editForm = $this->createForm(new TextAdType(), $entity);

        return $this->render('ClassCentralSiteBundle:TextAd:edit.html.twig', array(
            'entity'      => $entity,
            'edit_form'   => $editForm->createView(),
        ));
    }

    /**
     * Edits an existing TextAd entity.
     *
     */
    public function updateAction(Request $request, $id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('ClassCentralSiteBundle:TextAd')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find TextAd entity.');
        }

        $editForm = $this->createForm(new TextAdType(), $entity);
        $editForm->bind($request);

        if ($editForm->isValid()) {
            $em->persist($entity);
            $em->flush();

            return $this->redirect($this->generateUrl('textad_edit', array('id' => $id)));
        }

        return $this->render('ClassCentralSiteBundle:TextAd:edit.html.twig', array(
            'entity'      => $entity,
            'edit_form'   => $editForm->createView(),
        ));
    }

}
